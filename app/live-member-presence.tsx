'use client';
import {useCallback,useEffect,useState} from 'react';
import {supabase} from '../lib/supabase';

type Member={id:string;email:string;name_ja?:string|null;name_en?:string|null;role?:string;active?:boolean};
type PresenceRow={user_id:string;status:string;updated_at:string};
const OPTIONS=[
 {value:'present',ja:'在室',en:'Available',color:'#169b68',detail:'対応可 / Available'},
 {value:'online',ja:'オンライン会議',en:'Online Meeting',color:'#287bc5',detail:'対応不可 / Busy'},
 {value:'meeting',ja:'学生打ち合わせ',en:'Student Meeting',color:'#e59a32',detail:'緊急時のみ / Urgent only'},
 {value:'class',ja:'授業',en:'In Class',color:'#8b6caf',detail:'対応不可 / Unavailable'},
 {value:'lab',ja:'実験室',en:'Laboratory',color:'#169baf',detail:'実験中 / In lab'},
 {value:'lunch',ja:'昼食',en:'Lunch',color:'#7b8f36',detail:'昼食中 / At lunch'},
 {value:'left',ja:'退勤',en:'Left',color:'#788598',detail:'退勤 / Off duty'},
 {value:'campus',ja:'学内',en:'On Campus',color:'#4478b0',detail:'学内 / On campus'},
 {value:'away',ja:'外出',en:'Away',color:'#8695a9',detail:'外出中 / Away'},
] as const;
const displayName=(m:Member)=>[m.name_ja,m.name_en].filter(Boolean).join(' / ')||m.email;
export default function LiveMemberPresence({currentUserId,people}:{currentUserId:string;people:Member[]}){
 const [items,setItems]=useState<PresenceRow[]>([]);
 const [error,setError]=useState('');const [saving,setSaving]=useState(false);
 const load=useCallback(async()=>{if(!supabase)return;const {data,error:err}=await supabase.from('member_live_presence').select('user_id,status,updated_at');if(err){setError('在室状況の取得に失敗 / Presence unavailable: '+err.message);return;}setItems((data||[]) as PresenceRow[]);setError('')},[]);
 useEffect(()=>{void load();const timer=setInterval(()=>{if(!document.hidden)void load()},30000);const client=supabase;if(!client)return()=>clearInterval(timer);const channel=client.channel('member-live-presence').on('postgres_changes',{event:'*',schema:'public',table:'member_live_presence'},()=>void load()).subscribe();return()=>{clearInterval(timer);void client.removeChannel(channel)}},[load]);
 const change=async(status:string)=>{if(!supabase||saving)return;setSaving(true);setError('');const old=items;setItems(v=>[...v.filter(i=>i.user_id!==currentUserId),{user_id:currentUserId,status,updated_at:new Date().toISOString()}]);const {error:err}=await supabase.from('member_live_presence').upsert({user_id:currentUserId,status,updated_at:new Date().toISOString()},{onConflict:'user_id'});if(err){setItems(old);setError('保存できません / Save failed: '+err.message)}else await load();setSaving(false)};
 const current=items.find(x=>x.user_id===currentUserId)?.status||'away';
 const visible=people.filter(m=>m.active!==false || m.id===currentUserId);
 return <section className="panel live-presence" aria-label="在室状況 / Current Presence">
  <div className="top"><h3>現在の在室状況 <span className="muted">/ Live Presence</span></h3><small className="muted">教員・学生 / Faculty & Students</small></div>
  {error&&<div className="schedule-hint" role="alert">{error}</div>}
  <div className="live-presence-layout"><div className="live-presence-self"><b>自分の状態を変更 / My Status</b><div className="live-presence-options">{OPTIONS.map(opt=><button type="button" key={opt.value} disabled={saving} aria-pressed={current===opt.value} className={'live-presence-option '+(current===opt.value?'is-selected':'')} onClick={()=>void change(opt.value)}><i style={{background:opt.color}}/><span>{opt.ja}<small>{opt.en}</small></span></button>)}</div></div>
  <div className="live-presence-members"><b>メンバーの現在の状態 / Member Status</b><div className="live-presence-list">{visible.map(m=>{const item=items.find(x=>x.user_id===m.id);const opt=OPTIONS.find(o=>o.value===item?.status)||OPTIONS.find(x=>x.value==='away')!;return <div className="live-presence-member" key={m.id}><span className="live-presence-member-name">{displayName(m)}{m.id===currentUserId&&<small>自分 / You</small>}</span><span className="live-presence-pill"><i style={{background:opt.color}}/>{opt.ja}<small>{opt.en}</small></span><span className="live-presence-description">{opt.detail}</span></div>})}</div></div></div>
 </section>
}
