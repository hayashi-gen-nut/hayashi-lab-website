import {NextRequest,NextResponse} from 'next/server';
import {createClient} from '@supabase/supabase-js';
export const runtime='nodejs';
export const dynamic='force-dynamic';
const fail=(message:string,status=400)=>NextResponse.json({error:message},{status});
function icsDate(raw:string,tz:string){
  const s=raw.trim();
  if(!/^\d{8}(T\d{6}Z?)?$/.test(s))return null;
  const y=s.slice(0,4),m=s.slice(4,6),d=s.slice(6,8);
  if(s.length===8)return new Date(`${y}-${m}-${d}T00:00:00+09:00`);
  const t=`${s.slice(9,11)}:${s.slice(11,13)}:${s.slice(13,15)}`;
  if(s.endsWith('Z'))return new Date(`${y}-${m}-${d}T${t}Z`);
  if(tz && !['Asia/Tokyo','Japan','Tokyo'].includes(tz))return null;
  return new Date(`${y}-${m}-${d}T${t}+09:00`);
}
function parseIcs(source:string){
  const lines=source.replace(/\r\n[ \t]/g,'').replace(/\n[ \t]/g,'').split(/\r?\n/);
  const events:{start:string;end:string;summary:string;busy:boolean}[]=[];
  let ev:Record<string,{value:string;tz:string}>|null=null;
  for(const line of lines){
    if(line==='BEGIN:VEVENT'){ev={};continue}
    if(line==='END:VEVENT'&&ev){
      const start=ev.DTSTART&&icsDate(ev.DTSTART.value,ev.DTSTART.tz);
      const end=ev.DTEND&&icsDate(ev.DTEND.value,ev.DTEND.tz);
      if(start&&end&&end>start&&ev.STATUS?.value!=='CANCELLED')events.push({start:start.toISOString(),end:end.toISOString(),summary:(ev.SUMMARY?.value||'予定').replace(/\\n/gi,' ').replace(/\\,/g,',').slice(0,200),busy:ev.TRANSP?.value!=='TRANSPARENT'});
      ev=null;continue;
    }
    if(!ev)continue;
    const colon=line.indexOf(':');if(colon<0)continue;
    const key=line.slice(0,colon).split(';')[0].toUpperCase();
    const tz=line.slice(0,colon).match(/TZID=([^;:]+)/i)?.[1]||'';
    if(['DTSTART','DTEND','SUMMARY','STATUS','TRANSP'].includes(key))ev[key]={value:line.slice(colon+1),tz};
  }
  return events;
}
export async function GET(req:NextRequest){
  try{
    const auth=req.headers.get('authorization')||'';
    const jwt=auth.startsWith('Bearer ')?auth.slice(7):'';
    if(!jwt)return fail('ログインが必要です',401);
    const url=process.env.NEXT_PUBLIC_SUPABASE_URL||'',key=process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY||'';
    if(!url||!key)return fail('Supabase未設定',503);
    const sb=createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}});
    const {data:{user},error}=await sb.auth.getUser(jwt);
    if(error||!user)return fail('ログイン期限が切れています',401);
    const service=process.env.SUPABASE_SERVICE_ROLE_KEY;
    if(!service)return fail('Server membership configuration missing',503);
    const adminDb=createClient(url,service,{auth:{persistSession:false,autoRefreshToken:false}});
    const {data:profile,error:profileError}=await adminDb.from('profiles').select('role,active').eq('id',user.id).maybeSingle();
    if(profileError||!profile||profile.active===false||!['admin','student','staff'].includes(profile.role))return fail('Active member access required',403);
    const isAdmin=profile.role==='admin';
    const day=req.nextUrl.searchParams.get('date')||'';
    if(!/^\d{4}-\d{2}-\d{2}$/.test(day)||Number.isNaN(new Date(day+'T00:00:00+09:00').getTime()))return fail('日付を確認してください');
    const feed=process.env.DESKNET_ICS_URL||process.env.GOOGLE_CALENDAR_ICS_URL;
    if(!feed)return fail('DESKNET_ICS_URL / GOOGLE_CALENDAR_ICS_URL が未設定です',503);
    const parsed=new URL(feed);
    if(!['http:','https:'].includes(parsed.protocol)||parsed.username||parsed.password)return fail('ICS URLの設定が不正です',503);
    const controller=new AbortController();const timeout=setTimeout(()=>controller.abort(),10000);
    let response:Response;
    try{response=await fetch(parsed.toString(),{headers:{Accept:'text/calendar'},redirect:'manual',cache:'no-store',signal:controller.signal})}finally{clearTimeout(timeout)}
    if(!response.ok)return fail(`desknetの取得に失敗しました (HTTP ${response.status})`,502);
    const body=await response.text();
    if(body.length>3000000||!body.includes('BEGIN:VCALENDAR'))return fail('有効なICS形式ではありません',502);
    const days=Math.min(14,Math.max(1,Number(req.nextUrl.searchParams.get('days')||1)||1));
    const begin=new Date(day+'T00:00:00+09:00').getTime(),end=begin+86400000*days;
    const events=parseIcs(body).filter(e=>new Date(e.start).getTime()<end&&new Date(e.end).getTime()>begin).sort((a,b)=>a.start.localeCompare(b.start));
    return NextResponse.json({events:isAdmin?events:events.map(e=>({...e,summary:'Busy',busy:true}))},{headers:{'Cache-Control':'private, no-store'}});
  }catch(e){return fail(`desknet取得エラー: ${e instanceof Error?e.message:'unknown'}`,502)}
}
