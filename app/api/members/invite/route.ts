import {NextRequest,NextResponse} from 'next/server';
import {createClient} from '@supabase/supabase-js';
export const runtime='nodejs';
const fail=(error:string,status=400)=>NextResponse.json({error},{status});
export async function POST(req:NextRequest){
 try{
  const token=req.headers.get('authorization')?.match(/^Bearer (.+)$/)?.[1];
  if(!token)return fail('Authentication required',401);
  const url=process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon=process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const secret=process.env.SUPABASE_SERVICE_ROLE_KEY;
  if(!url||!anon||!secret)return fail('Supabase admin environment is not configured',503);
  const client=createClient(url,anon,{global:{headers:{Authorization:`Bearer ${token}`}},auth:{persistSession:false,autoRefreshToken:false}});
  const {data:{user},error:userError}=await client.auth.getUser(token);
  if(userError||!user)return fail('Invalid session',401);
  const {data:profile,error:profileError}=await client.from('profiles').select('role,active').eq('id',user.id).single();
  if(profileError||!profile||profile.role!=='admin'||profile.active!==true)return fail('Administrator access required',403);
  const body=await req.json();const email=String(body.email||'').trim().toLowerCase();const directoryId=typeof body.directoryId==='string'&&/^[0-9a-f-]{36}$/i.test(body.directoryId)?body.directoryId:'';
  if(email.length>254||!(/^[^\s@]+@[^\s@]+\.[^\s@]+$/).test(email))return fail('Invalid email');
  const service=createClient(url,secret,{auth:{persistSession:false,autoRefreshToken:false}});
  const {data,error}=await service.auth.admin.inviteUserByEmail(email);
  if(error)return fail(error.message,400);
  if(!data.user)return fail('Invitation user not returned',502);
  // Do not overwrite roles or active flags on existing profiles.
  const {data:existing,error:lookupError}=await service.from('profiles').select('id').eq('id',data.user.id).maybeSingle();
  if(lookupError)return fail('Invitation sent, but profile lookup failed: '+lookupError.message,500);
  if(existing){if(directoryId){const {error:linkErr}=await service.from('lab_member_directory').update({linked_user_id:data.user.id,email}).eq('id',directoryId);if(linkErr)return fail('Invitation completed; member link failed: '+linkErr.message,500)}return NextResponse.json({ok:true,alreadyRegistered:true})};
  const {data:directory}=directoryId?await service.from('lab_member_directory').select('name_ja,name_en,grade,student_number,previous_school').eq('id',directoryId).maybeSingle():{data:null};
  const {error:upsertError}=await service.from('profiles').insert({id:data.user.id,email,role:'student',active:true,...(directory?{name_ja:directory.name_ja,name_en:directory.name_en,grade:directory.grade,student_number:directory.student_number,previous_school:directory.previous_school}:{})});
  if(upsertError)return fail('Invitation sent, but profile setup failed: '+upsertError.message,500);
  if(directoryId){const {error:linkErr}=await service.from('lab_member_directory').update({linked_user_id:data.user.id,email}).eq('id',directoryId);if(linkErr)return fail('Invitation completed; member link failed: '+linkErr.message,500)}
  return NextResponse.json({ok:true});
 }catch(e){return fail(e instanceof Error?e.message:'Unknown error',500)}
}
