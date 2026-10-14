import {NextRequest,NextResponse} from 'next/server';
import {createClient} from '@supabase/supabase-js';
export const runtime='nodejs';
const MAX=4*1024*1024;
function fail(message:string,status=400){return NextResponse.json({error:message},{status});}
async function context(req:NextRequest){
 const url=process.env.NEXT_PUBLIC_SUPABASE_URL,key=process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
 const token=req.headers.get('authorization')?.replace(/^Bearer\s+/i,'');
 if(!url||!key||!token)throw Error('Authentication required');
 const db=createClient(url,key,{global:{headers:{Authorization:`Bearer ${token}`}},auth:{persistSession:false,autoRefreshToken:false}});
 const {data:{user},error}=await db.auth.getUser(token);if(error||!user)throw Error('Invalid session');
 return {db,user};
}
async function dropboxToken(){
 const id=process.env.DROPBOX_APP_KEY,secret=process.env.DROPBOX_APP_SECRET,refresh=process.env.DROPBOX_REFRESH_TOKEN;
 if(!id||!secret||!refresh)throw Error('Dropbox credentials are not configured on Vercel');
 const res=await fetch('https://api.dropbox.com/oauth2/token',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams({grant_type:'refresh_token',refresh_token:refresh,client_id:id,client_secret:secret}),cache:'no-store'});
 if(!res.ok)throw Error('Dropbox token refresh failed');const data=await res.json();return data.access_token as string;
}
function clean(s:string){return s.normalize('NFKC').replace(/[\\/<>:"|?*\x00-\x1f]/g,'_').replace(/^\.+/,'_').slice(0,110)||'file';}
const folders:Record<string,string>={meeting:'02_Meetings',seminar:'02_Meetings',output:'03_Submitted_Papers',thesis:'04_Theses',assignment:'05_Internships',class:'06_Courses',course:'06_Courses',document:'07_Lab_Documents',task:'07_Lab_Documents'};
async function record(db:Awaited<ReturnType<typeof context>>['db'],id:string){const {data,error}=await db.from('records').select('id,kind,title,owner_id,deleted_at').eq('id',id).is('deleted_at',null).single();if(error||!data)throw Error('Record not accessible');return data;}
async function dropbox(endpoint:string,token:string,arg:unknown,body?:BodyInit){return fetch('https://content.dropboxapi.com/2/files/'+endpoint,{method:'POST',headers:{Authorization:`Bearer ${token}`,'Dropbox-API-Arg':JSON.stringify(arg),'Content-Type':'application/octet-stream'},body,cache:'no-store'});}
export async function POST(req:NextRequest){try{
 const {db,user}=await context(req);const form=await req.formData();const recordId=String(form.get('recordId')||'');const file=form.get('file');
 if(!recordId||!(file instanceof File))return fail('File and record are required');
 if(file.size>MAX)return fail('Files must be 4 MB or smaller; larger uploads require an upload-session implementation',413);
 const r=await record(db,recordId);if(r.owner_id!==user.id){const {data:p}=await db.from('profiles').select('role').eq('id',user.id).single();if(p?.role!=='admin')return fail('Only record owner or administrator can upload',403);}
 const root=process.env.DROPBOX_ROOT_FOLDER||'/Research_Lab_Hub';
 const path=`${root}/${folders[r.kind]||'07_Lab_Documents'}/${clean(r.title)}_${r.id}/${crypto.randomUUID()}_${clean(file.name)}`;
 const token=await dropboxToken();const resp=await dropbox('upload',token,{path,mode:'add',autorename:false,mute:true},await file.arrayBuffer());
 if(!resp.ok)return fail('Dropbox upload failed',502);
 const {error}=await db.from('file_entries').insert({record_id:r.id,uploader_id:user.id,path,original_name:file.name,mime:file.type||'application/octet-stream',size_bytes:file.size,version:1});
 if(error){await dropbox('delete_v2',token,{path}).catch(()=>{});return fail('File uploaded, but metadata registration failed: '+error.message,500);}
 return NextResponse.json({ok:true,path});
 }catch(e){return fail(e instanceof Error?e.message:'Unexpected error',401)}}
export async function GET(req:NextRequest){try{
 const {db}=await context(req);const id=req.nextUrl.searchParams.get('id');if(!id)return fail('File ID required');
 const {data:f,error}=await db.from('file_entries').select('id,record_id,path,original_name').eq('id',id).is('deleted_at',null).single();if(error||!f)return fail('File not accessible',403);
 await record(db,f.record_id);const token=await dropboxToken();const resp=await dropbox('download',token,{path:f.path});if(!resp.ok)return fail('Dropbox download failed',502);
 return new NextResponse(await resp.arrayBuffer(),{headers:{'Content-Type':'application/octet-stream','Content-Disposition':`attachment; filename*=UTF-8''${encodeURIComponent(f.original_name)}`,'Cache-Control':'private, no-store'}});
 }catch(e){return fail(e instanceof Error?e.message:'Unexpected error',401)}}
export async function DELETE(req:NextRequest){try{
 const {db,user}=await context(req);const id=req.nextUrl.searchParams.get('id');if(!id)return fail('File ID required');
 const {data:f,error}=await db.from('file_entries').select('id,record_id,uploader_id').eq('id',id).is('deleted_at',null).single();if(error||!f)return fail('File not accessible',403);
 await record(db,f.record_id);const {data:p}=await db.from('profiles').select('role').eq('id',user.id).single();if(f.uploader_id!==user.id&&p?.role!=='admin')return fail('Not permitted',403);
 const result=await db.from('file_entries').update({deleted_at:new Date().toISOString()}).eq('id',id);if(result.error)return fail(result.error.message,403);
 return NextResponse.json({ok:true});
 }catch(e){return fail(e instanceof Error?e.message:'Unexpected error',401)}}
