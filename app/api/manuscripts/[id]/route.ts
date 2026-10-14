import {NextRequest,NextResponse} from 'next/server';
import {createClient} from '@supabase/supabase-js';
export const runtime='nodejs';
function error(message:string,status=400){return NextResponse.json({error:message},{status});}
async function dropboxAccessToken(){
 const appKey=process.env.DROPBOX_APP_KEY,secret=process.env.DROPBOX_APP_SECRET,refresh=process.env.DROPBOX_REFRESH_TOKEN;
 if(!appKey||!secret||!refresh)throw new Error('Dropbox credentials are not configured');
 const resp=await fetch('https://api.dropbox.com/oauth2/token',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams({grant_type:'refresh_token',refresh_token:refresh,client_id:appKey,client_secret:secret}),cache:'no-store'});
 if(!resp.ok)throw new Error('Dropbox token refresh failed');
 const body=await resp.json();return body.access_token as string;
}
export async function DELETE(req:NextRequest,{params}:{params:Promise<{id:string}>}){
 try{
  const {id}=await params;
  const url=process.env.NEXT_PUBLIC_SUPABASE_URL,anon=process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,service=process.env.SUPABASE_SERVICE_ROLE_KEY;
  const bearer=req.headers.get('authorization')?.replace(/^Bearer\s+/i,'');
  if(!url||!anon||!service)return error('Server configuration missing; SUPABASE_SERVICE_ROLE_KEY required',503);
  if(!bearer)return error('Authentication required',401);
  const client=createClient(url,anon,{auth:{persistSession:false,autoRefreshToken:false}});
  const {data:{user},error:authError}=await client.auth.getUser(bearer);
  if(authError||!user)return error('Invalid login session',401);
  const adminDb=createClient(url,service,{auth:{persistSession:false,autoRefreshToken:false}});
  const {data:profile,error:profileError}=await adminDb.from('profiles').select('role,active').eq('id',user.id).single();
  if(profileError)return error('Profile lookup failed: '+profileError.message+' (verify Vercel Supabase project and database schema)',403);
  if(!profile)return error('No member profile for this signed-in account. Register this user in public.profiles before deleting.',403);
  if(profile.active===false)return error('Member profile is inactive. Ask the administrator to activate this account.',403);
  if(!['admin','student','staff'].includes(profile.role))return error('This account role cannot delete records: '+profile.role,403);
  const {data:r,error:rErr}=await adminDb.from('records').select('id,kind,owner_id,deleted_at,body').eq('id',id).single();
  if(rErr||!r||r.deleted_at)return error('Record not found',404);
  const isConference=r.kind==='project'&&r.body?.conferenceHub===true;
  if(r.kind!=='output'&&!isConference)return error('Unsupported record type',400);
  if(isConference){
   const {data:papers,error:paperError}=await adminDb.from('records').select('id,body').eq('kind','output').is('deleted_at',null);
   if(paperError)return error('Cannot check linked manuscripts: '+paperError.message,500);
   if((papers||[]).some(p=>p.body?.conferenceId===id))return error('This conference has linked manuscripts. Unlink or delete them first.',409);
  }
  if(r.owner_id!==user.id&&profile.role!=='admin')return error('Only creator or administrator may delete',403);
  const {data:attachments,error:fileErr}=await adminDb.from('file_entries').select('id,path,deleted_at').eq('record_id',id);
  if(fileErr)throw Error('File listing failed: '+fileErr.message);
  const live=(attachments||[]).filter(f=>!f.deleted_at);
  // Delete actual Dropbox files before hiding the DB record; failures remain visible and retryable.
  if(live.length){
   const token=await dropboxAccessToken();
   for(const file of live){
    const res=await fetch('https://api.dropboxapi.com/2/files/delete_v2',{method:'POST',headers:{Authorization:'Bearer '+token,'Content-Type':'application/json'},body:JSON.stringify({path:file.path}),cache:'no-store'});
    if(!res.ok){
     const response=await res.text();
     if(!(res.status===409&&response.includes('not_found')))throw Error('Dropbox file deletion failed. Manuscript not deleted. '+response.slice(0,250));
    }
    const {error:flagError}=await adminDb.from('file_entries').update({deleted_at:new Date().toISOString()}).eq('id',file.id);
    if(flagError)throw Error('Dropbox file deleted but metadata update failed: '+flagError.message);
   }
  }
  const {error:deleteError}=await adminDb.from('records').update({deleted_at:new Date().toISOString()}).eq('id',id);
  if(deleteError)throw Error('Manuscript record update failed: '+deleteError.message);
  return NextResponse.json({ok:true,removedFiles:live.length});
 }catch(e){return error(e instanceof Error?e.message:'Delete operation failed',500)}
}
