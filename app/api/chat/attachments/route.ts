import {NextRequest,NextResponse} from 'next/server';
import {createClient} from '@supabase/supabase-js';
export const runtime='nodejs';
const MAX=4*1024*1024;
const fail=(error:string,status=400)=>NextResponse.json({error},{status});
async function context(req:NextRequest){
 const url=process.env.NEXT_PUBLIC_SUPABASE_URL,anon=process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,service=process.env.SUPABASE_SERVICE_ROLE_KEY;
 const token=req.headers.get('authorization')?.replace(/^Bearer\s+/i,'');
 if(!url||!anon||!service||!token)throw Error('Missing credentials or session');
 const client=createClient(url,anon,{global:{headers:{Authorization:`Bearer ${token}`}},auth:{persistSession:false,autoRefreshToken:false}});
 const {data:{user},error}=await client.auth.getUser(token);
 if(error||!user)throw Error('Not authenticated');
 const admin=createClient(url,service,{auth:{persistSession:false,autoRefreshToken:false}});
 const {data:profile,error:pe}=await admin.from('profiles').select('role,active').eq('id',user.id).single();
 if(pe)throw Error('Profile lookup failed: '+pe.message+'; check SUPABASE_SERVICE_ROLE_KEY and Supabase project');if(!profile?.active||!['admin','student','staff'].includes(profile.role))throw Error('Active lab membership required');
 return {client,admin,user};
}
async function dbxToken(){const key=process.env.DROPBOX_APP_KEY,secret=process.env.DROPBOX_APP_SECRET,refresh=process.env.DROPBOX_REFRESH_TOKEN;if(!key||!secret||!refresh)throw Error('Dropbox not configured');const r=await fetch('https://api.dropbox.com/oauth2/token',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams({grant_type:'refresh_token',refresh_token:refresh,client_id:key,client_secret:secret})});if(!r.ok)throw Error('Dropbox authentication failed');return (await r.json()).access_token as string}
const clean=(s:string)=>s.normalize('NFKC').replace(/[\\/<>:"|?*\x00-\x1f]/g,'_').slice(0,100)||'attachment';
export async function POST(req:NextRequest){try{
 const {admin,user}=await context(req);const form=await req.formData();const id=String(form.get('messageId')||'');const file=form.get('file');
 if(!/^[a-f\d-]{36}$/i.test(id)||!(file instanceof File))return fail('Message and file required');
 if(file.size>MAX)return fail('Maximum file size: 4 MB',413);
 const allowed=['application/pdf','image/png','image/jpeg','image/webp','image/gif'];if(!allowed.includes(file.type))return fail('PDF/JPG/PNG/WebP/GIF only');
 const {data:m,error:messageError}=await admin.from('chat_messages').select('id,author_id,deleted_at,topic_id').eq('id',id).eq('channel','lab').maybeSingle();
 if(messageError)return fail('Cannot read message: '+messageError.message+'; verify Supabase service role key',503);
 if(!m||m.deleted_at)return fail('Message not available for attachment; verify app and server use the same Supabase project',404);if(m.author_id!==user.id)return fail('Attachment permission mismatch: please sign out and sign in again with the message author account',403);
 if(m.topic_id){const {data:t}=await admin.from('chat_topics').select('deleted_at,archived').eq('id',m.topic_id).single();if(!t||t.deleted_at||t.archived)return fail('Topic is not available',403)}
 const path=`${process.env.DROPBOX_ROOT_FOLDER||'/Research_Lab_Hub'}/08_Chat/${id}/${crypto.randomUUID()}_${clean(file.name)}`;
 const token=await dbxToken();const upload=await fetch('https://content.dropboxapi.com/2/files/upload',{method:'POST',headers:{Authorization:`Bearer ${token}`,'Dropbox-API-Arg':JSON.stringify({path,mode:'add',autorename:false,mute:true}),'Content-Type':'application/octet-stream'},body:await file.arrayBuffer()});
 if(!upload.ok)return fail('Dropbox upload failed',502);
 const {data,error}=await admin.from('chat_attachments').insert({message_id:id,uploader_id:user.id,original_name:file.name,mime:file.type,size_bytes:file.size,path}).select('id').single();
 if(error){await fetch('https://api.dropboxapi.com/2/files/delete_v2',{method:'POST',headers:{Authorization:`Bearer ${token}`,'Content-Type':'application/json'},body:JSON.stringify({path})}).catch(()=>{});return fail('Attachment metadata failed: '+error.message,500)}
 return NextResponse.json({ok:true,id:data.id});
 }catch(e){return fail(e instanceof Error?e.message:'Upload failed',401)}}
export async function GET(req:NextRequest){try{
 const {client,admin}=await context(req);const id=req.nextUrl.searchParams.get('id');if(!id)return fail('Attachment ID required');
 const {data:a,error}=await client.from('chat_attachments').select('id,message_id,original_name,mime,path').eq('id',id).single();if(error||!a)return fail('Attachment inaccessible',403);
 // Recheck message visibility immediately before serving bytes.
 const {data:m}=await admin.from('chat_messages').select('deleted_at,topic_id').eq('id',a.message_id).single();if(!m||m.deleted_at)return fail('Message unavailable',403);
 if(m.topic_id){const {data:t}=await admin.from('chat_topics').select('deleted_at').eq('id',m.topic_id).single();if(!t||t.deleted_at)return fail('Topic unavailable',403)}
 const token=await dbxToken();const resp=await fetch('https://content.dropboxapi.com/2/files/download',{method:'POST',headers:{Authorization:`Bearer ${token}`,'Dropbox-API-Arg':JSON.stringify({path:a.path})}});if(!resp.ok)return fail('Dropbox download failed',502);
 return new NextResponse(await resp.arrayBuffer(),{headers:{'Content-Type':a.mime,'Content-Disposition':`inline; filename*=UTF-8''${encodeURIComponent(a.original_name)}`,'Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff'}});
 }catch(e){return fail(e instanceof Error?e.message:'Download failed',401)}}
