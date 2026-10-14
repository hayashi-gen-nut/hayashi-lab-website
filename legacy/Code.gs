/** Research Lab Manager — Google Apps Script backend. Deploy as user accessing app. */
const CFG = {ROOT:'Research Lab Manager', DB:'Research Lab Manager Database', TZ:'Asia/Tokyo',
 TABLES:{Members:['id','name','nameJa','nameEn','email','role','grade','active','createdAt'],Destinations:['id','name','country','city','category','notes','createdAt'],Assignments:['id','year','memberId','kind','destinationId','topic','startDate','endDate','summary','handover','createdAt'],Submissions:['id','assignmentId','month','docType','format','fileId','fileName','version','submittedAt','visibility'],Meetings:['id','title','date','start','end','method','location','participants','primaryMemberId','notes','nextTasks','createdAt'],MeetingFiles:['id','meetingId','fileId','fileName','uploadedAt','uploadedBy'],ClassSchedules:['id','title','weekday','start','end','startDate','endDate','active','createdAt','repeatType','repeatCount'] ,CourseCatalog:['id','title','active','createdAt'],Tasks:['id','meetingId','assigneeId','title','dueDate','done','createdAt'],Thesis:['id','memberId','parentId','position','title','status','notes'],Outputs:['id','kind','title','venue','year','authors','status','deadline','notes','parentId','createdAt'],Deliverables:['id','outputId','type','deadline','internalDeadline','status','fileId','submittedAt'],Presence:['id','memberId','status','returnStatus','until','updatedAt','detail'],PresenceLogs:['id','memberId','status','startedAt','endedAt','source'],LabDocuments:['id','title','category','description','visibility','fileId','fileName','version','uploadedAt','active','sortOrder'],Seminars:['id','date','start','end','location','method','groups','title','agendaFileId','minutesFileId','previousMinutesId','agendaText','minutesText','locked','createdAt'],SeminarPresentations:['id','seminarId','memberId','title','position','start','end','createdAt','durationMinutes'],SeminarFiles:['id','seminarId','presentationId','kind','memberId','fileId','fileName','version','uploadedAt'],SeminarComments:['id','seminarId','presentationId','fileId','authorId','body','status','createdAt'],SeminarEvents:['id','seminarId','presentationId','type','at','actorId','createdAt'],SeminarNotes:['id','seminarId','presentationId','kind','body','assigneeId','dueDate','status','authorId','createdAt','updatedAt']}};
function setup(){const p=PropertiesService.getScriptProperties();if(p.getProperty('DB_ID'))return repairDatabase();const root=DriveApp.createFolder(CFG.ROOT);['01_Members','02_Meetings','03_Publications','04_Projects','05_Practical_Training','06_Lab_Documents','07_Seminars','99_Archive'].forEach(n=>root.createFolder(n));const db=SpreadsheetApp.create(CFG.DB);Object.entries(CFG.TABLES).forEach(([n,cols])=>{const s=n==='Members'?db.getSheets()[0].setName(n):db.insertSheet(n);s.appendRow(cols);s.setFrozenRows(1)});p.setProperties({ROOT_ID:root.getId(),DB_ID:db.getId(),ADMIN_EMAIL:Session.getEffectiveUser().getEmail()});return `Initialized: ${db.getUrl()}`}
function doGet(){return HtmlService.createHtmlOutputFromFile('Index').setTitle('Research Lab Manager').addMetaTag('viewport','width=device-width, initial-scale=1')}
function db_(){const id=PropertiesService.getScriptProperties().getProperty('DB_ID');if(!id)throw Error('Run setup() from Apps Script editor first');return SpreadsheetApp.openById(id)}
let _rlmDbContext=null;
function sheet_(table){
 if(!CFG.TABLES[table])throw Error('Unknown table: '+table);
 const sh=(_rlmDbContext||db_()).getSheetByName(table);
 if(!sh)throw Error('Missing database sheet: '+table+'. Administrator: run repairDatabase() in Apps Script editor.');
 return sh;
}
/** Non-destructive schema repair. Existing rows, columns, and sheets are retained. */
function repairDatabase(){
 const db=db_(),lock=LockService.getScriptLock();lock.waitLock(30000);
 try{
  const created=[],added=[];
  for(const [name,columns] of Object.entries(CFG.TABLES)){
   let sh=db.getSheetByName(name);
   if(!sh){sh=db.insertSheet(name);sh.getRange(1,1,1,columns.length).setValues([columns]);sh.setFrozenRows(1);created.push(name);continue;}
   if(sh.getLastRow()===0){sh.getRange(1,1,1,columns.length).setValues([columns]);sh.setFrozenRows(1);added.push(name+': headers');continue;}
   const current=sh.getRange(1,1,1,sh.getLastColumn()).getDisplayValues()[0];
   for(const col of columns){if(!current.includes(col)){sh.getRange(1,sh.getLastColumn()+1).setValue(col);current.push(col);added.push(name+'.'+col);}}
  }
  return JSON.stringify({createdSheets:created,addedColumns:added,spreadsheetUrl:db.getUrl()});
 }finally{lock.releaseLock();}
}

/** Request-scoped snapshot: never shared between users or different calls. */
let _rlmReadContext=null;
function rows_(table){
 if(_rlmReadContext&&_rlmReadContext[table])return _rlmReadContext[table];
 const sh=sheet_(table), last=sh.getLastRow(), width=sh.getLastColumn();
 if(!last||!width)return [];
 const vals=sh.getRange(1,1,last,width).getDisplayValues(),keys=vals.shift();
 const out=vals.filter(r=>r[0]).map(r=>Object.fromEntries(keys.map((k,i)=>[k,r[i]])));
 if(_rlmReadContext)_rlmReadContext[table]=out;
 return out;
}
function user_(){const email=Session.getActiveUser().getEmail().toLowerCase();if(!email)throw Error('Google identity could not be verified. Use a deployment that exposes the signed-in user identity, or Workspace authentication.');const admin=(PropertiesService.getScriptProperties().getProperty('ADMIN_EMAIL')||'').toLowerCase();if(email===admin)return {email,role:'admin'};const m=rows_('Members').find(x=>x.email.toLowerCase()===email&&x.active!=='false');if(!m)throw Error('このGoogleアカウントは招待されていません。研究室管理者にお問い合わせください。');if(!['student','staff','collaborator'].includes(m.role))throw Error('管理者権限は招待では付与できません。');return {email,role:m.role,id:m.id,name:m.name}}
function isLabMember_(u){return u.role==='student'||u.role==='staff'}
function visible_(table,items,u){if(u.role==='admin')return items;if(['Seminars','SeminarPresentations','SeminarFiles','SeminarComments'].includes(table)){if(u.role==='collaborator')return [];if(table==='Seminars')return items;const ids=new Set(rows_('Seminars').map(x=>x.id));return items.filter(x=>ids.has(x.seminarId));}if(table==='LabDocuments')return items.filter(x=>x.active!=='false'&&(x.visibility==='lab'||(u.role==='collaborator'&&x.visibility==='collaborators'))&&(u.role!=='collaborator'||x.visibility==='collaborators'));if(table==='Members')return items.filter(x=>x.active!=='false').map(({id,name,nameJa,nameEn,grade,role,active})=>({id,name,nameJa,nameEn,grade,role,active}));if(table==='Destinations')return isLabMember_(u)?items:[];if(table==='Assignments')return isLabMember_(u)?items.map(x=>({...x,summary:x.summary||'',handover:x.handover||''})):items.filter(x=>x.memberId===u.id);if(table==='Submissions'){const owner=new Map(rows_('Assignments').map(a=>[a.id,a.memberId]));return items.filter(x=>owner.get(x.assignmentId)===u.id||(isLabMember_(u)&&x.visibility==='lab'));}if(table==='ClassSchedules')return isLabMember_(u)?items:[];if(table==='MeetingFiles')return (u.role==='admin'||isLabMember_(u))?items:[];if(table==='Meetings')return items.filter(x=>u.role!=='collaborator'||(x.participants||'').split(',').includes(u.id));if(table==='Tasks')return items.filter(x=>u.role!=='collaborator'||x.assigneeId===u.id);if(table==='Thesis')return isLabMember_(u)?items:items.filter(x=>x.memberId===u.id);if(table==='Outputs')return items.filter(x=>isLabMember_(u)||String(x.authors||'').split(',').map(v=>v.trim()).includes(u.id));if(table==='Deliverables'){const allowed=new Set(visible_('Outputs',rows_('Outputs'),u).map(o=>o.id));return items.filter(x=>allowed.has(x.outputId))};return []}
function apiList(table){const u=user_();return {user:u,rows:visible_(table,rows_(table),u)}}
function canWrite_(table,record,u){if(u.role==='admin')return true;if(table==='Submissions'){const a=rows_('Assignments').find(x=>x.id===record.assignmentId);return !!a&&a.memberId===u.id}if(table==='MeetingFiles')return isLabMember_(u)&&rows_('Meetings').some(x=>x.id===record.meetingId);if(table==='Tasks')return isLabMember_(u)&&record.assigneeId===u.id;if(table==='Thesis')return isLabMember_(u)&&record.memberId===u.id;return false}
function apiSave(table,obj){const u=user_();if(!CFG.TABLES[table])throw Error('Unknown table');const old=obj.id?rows_(table).find(x=>x.id===obj.id):null;if(!canWrite_(table,old||obj,u))throw Error('Permission denied');if(old&&table==='Submissions')throw Error('Submitted files are immutable. Upload a new version');const s=sheet_(table),keys=s.getRange(1,1,1,s.getLastColumn()).getDisplayValues()[0],id=obj.id||Utilities.getUuid();const payload={...(old||{}),...obj,id};
if(table==='Meetings'){
 const participants=String(payload.participants||'').split(',').map(x=>x.trim()).filter(Boolean);
 if(payload.primaryMemberId&&!rows_('Members').some(m=>m.id===payload.primaryMemberId))throw Error('Invalid primary member');
 if(payload.primaryMemberId&&!participants.includes(payload.primaryMemberId))throw Error('主担当者を参加者にも選択してください。');
 if(!/^\d{4}-\d{2}-\d{2}$/.test(String(payload.date||'')))throw Error('日付を入力してください。');
 if(!old&&payload.primaryMemberId){
  const previous=rows_('Meetings').filter(m=>m.primaryMemberId===payload.primaryMemberId);
  const nums=previous.map(m=>{const match=String(m.title||'').match(/^第(\d+)回個別ゼミ_/);return match?Number(match[1]):-1;});
  const seq=Math.max(-1,...nums)+1;
  payload.title='第'+String(seq).padStart(2,'0')+'回個別ゼミ_'+String(payload.date).replace(/-/g,'');
 }
}
if(!old&&keys.includes('createdAt'))payload.createdAt=new Date().toISOString();const data=keys.map(k=>String(payload[k]??''));if(old){const all=s.getRange(2,1,Math.max(1,s.getLastRow()-1),1).getDisplayValues();const i=all.findIndex(r=>r[0]===id);if(i<0)throw Error('Missing record');s.getRange(i+2,1,1,keys.length).setValues([data])}else s.appendRow(data);return payload}
function apiDeleteMeeting(id){
 const u=user_();if(u.role!=='admin')throw Error('Admin only');
 const sh=sheet_('Meetings'),items=rows_('Meetings'),index=items.findIndex(x=>x.id===id);
 if(index<0)throw Error('打ち合わせが見つかりません / Meeting not found');
 sh.deleteRow(index+2);
 // Associated action items must not point to a deleted meeting.
 const mf=sheet_('MeetingFiles'),mr=rows_('MeetingFiles');for(let i=mr.length-1;i>=0;i--)if(mr[i].meetingId===id)mf.deleteRow(i+2);
 const tasks=sheet_('Tasks');const taskRows=rows_('Tasks');
 for(let i=taskRows.length-1;i>=0;i--)if(taskRows[i].meetingId===id)tasks.deleteRow(i+2);
 return {deleted:true,id};
}
/** PDF attachments for registered meetings. Files stay in Drive until explicitly deleted. */
function migrateV45(){return repairDatabase()}
function apiUploadMeetingPdf(d){
 const u=user_();if(u.role!=='admin'&&!isLabMember_(u))throw Error('Permission denied');
 const meeting=rows_('Meetings').find(x=>x.id===d.meetingId);if(!meeting)throw Error('Meeting not found');
 const original=String(d.filename||'');if(!/\.pdf$/i.test(original))throw Error('PDF only');
 const bytes=Utilities.base64Decode(d.base64||'');if(bytes.length<5||bytes.length>8*1024*1024)throw Error('PDF must be 8 MB or smaller');
 if(bytes[0]!==37||bytes[1]!==80||bytes[2]!==68||bytes[3]!==70||bytes[4]!==45)throw Error('Invalid PDF');
 let folder=folder_(root_(),'02_Meetings');folder=folder_(folder,String(meeting.date||'Undated').replace(/[^0-9-]/g,'')+'_'+String(meeting.id).replace(/[^a-zA-Z0-9-]/g,''));
 const filename=Utilities.getUuid()+'.pdf';const file=folder.createFile(Utilities.newBlob(bytes,'application/pdf',filename));
 try{return apiSave('MeetingFiles',{meetingId:meeting.id,fileId:file.getId(),fileName:original.slice(0,200),uploadedAt:new Date().toISOString(),uploadedBy:u.id||u.email||''})}
 catch(e){file.setTrashed(true);throw e}
}
function apiMeetingPdfUrl(fileId){
 const u=user_();if(u.role!=='admin'&&!isLabMember_(u))throw Error('Permission denied');
 const rec=rows_('MeetingFiles').find(x=>x.fileId===fileId);if(!rec||!rows_('Meetings').some(x=>x.id===rec.meetingId))throw Error('File not found');
 return DriveApp.getFileById(fileId).getUrl();
}
function apiDeleteMeetingPdf(id){
 const u=user_();if(u.role!=='admin')throw Error('Admin only');
 const sh=sheet_('MeetingFiles'),rows=rows_('MeetingFiles'),i=rows.findIndex(x=>x.id===id);if(i<0)throw Error('File not found');
 DriveApp.getFileById(rows[i].fileId).setTrashed(true);sh.deleteRow(i+2);return true;
}
function apiClassData(){
 const u=user_();if(u.role!=='admin')throw Error('Admin only');
 migrateV26();return {classes:apiClassSchedules(),courses:apiCourseCatalog()};
}
function folder_(parent,name){const it=parent.getFoldersByName(name);return it.hasNext()?it.next():parent.createFolder(name)}
function root_(){return DriveApp.getFolderById(PropertiesService.getScriptProperties().getProperty('ROOT_ID'))}
function uploadPdfOrExcel(data){const u=user_();const a=rows_('Assignments').find(x=>x.id===data.assignmentId);if(!a)throw Error('Assignment not found');if(u.role!=='admin'&&a.memberId!==u.id)throw Error('Permission denied');if(!/^\d{4}-\d{2}$/.test(data.month))throw Error('Invalid month');if(!['TrainingLog','TrainingReport','ResearchReport'].includes(data.docType))throw Error('Invalid document type');const mime={'pdf':'application/pdf','xlsx':'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet','xls':'application/vnd.ms-excel'};const ext=String(data.filename||'').split('.').pop().toLowerCase();if(!mime[ext])throw Error('Only PDF, XLSX, XLS files are allowed');const raw=Utilities.base64Decode(data.base64);if(raw.length>8*1024*1024)throw Error('File exceeds 8 MB. Use a smaller file or a Drive link');const member=rows_('Members').find(x=>x.id===a.memberId);const kind={'overseas':'01_Overseas','domestic':'02_Domestic','research':'03_Research_Projects'}[a.kind]||'03_Research_Projects';let f=folder_(root_(),'05_Practical_Training');for(const part of [a.year,kind,`${a.memberId}_${(member?.name||'Member').replace(/[\\/:*?"<>|]/g,'_')}`,data.month])f=folder_(f,part);const previous=rows_('Submissions').filter(x=>x.assignmentId===a.id&&x.month===data.month&&x.docType===data.docType&&x.format===ext);const version=previous.length+1;const filename=`${data.month.replace('-','')}_${a.memberId}_${data.docType}_v${String(version).padStart(2,'0')}.${ext}`;const file=f.createFile(Utilities.newBlob(raw,mime[ext],filename));const rec=apiSave('Submissions',{assignmentId:a.id,month:data.month,docType:data.docType,format:ext,fileId:file.getId(),fileName:filename,version,submittedAt:new Date().toISOString(),visibility:'private'});return {record:rec,url:file.getUrl()}}
function apiFileUrl(id){const u=user_();const s=rows_('Submissions').find(x=>x.fileId===id);if(!s)throw Error('Not found');const a=rows_('Assignments').find(x=>x.id===s.assignmentId);if(u.role!=='admin'&&a?.memberId!==u.id&&s.visibility!=='lab')throw Error('Permission denied');return DriveApp.getFileById(id).getUrl()}
/** Small first payload; permissions are ALWAYS applied on the server. */
const RLM_CORE_TABLES=['Members','Assignments','Outputs','Meetings','Submissions'];
function apiOverview(){
 const started=Date.now();_rlmReadContext=Object.create(null);_rlmDbContext=db_();
 try{
  const u=user_(),tables={};
  for(const name of RLM_CORE_TABLES)tables[name]=visible_(name,rows_(name),u);
  console.log('[RLM performance] bootstrap '+(Date.now()-started)+' ms');
  return {user:u,tables};
 }finally{_rlmReadContext=null;_rlmDbContext=null;}
}
/** Load a limited set of tables only when its screen is first opened. */
function apiLoadTables(names){
 if(!Array.isArray(names)||names.length>12||names.some(n=>typeof n!=='string'||!Object.prototype.hasOwnProperty.call(CFG.TABLES,n)))throw Error('Invalid table request');
 const started=Date.now();_rlmReadContext=Object.create(null);_rlmDbContext=db_();
 try{
  const u=user_(),tables={};
  for(const name of new Set(names))tables[name]=visible_(name,rows_(name),u);
  console.log('[RLM performance] lazy '+names.join(',')+' '+(Date.now()-started)+' ms');
  return tables;
 }finally{_rlmReadContext=null;_rlmDbContext=null;}
}

/** v0.2 migration. Run once after upgrading an existing deployment. */
function migrateV02(){const db=db_();['Presence','PresenceLogs'].forEach(n=>{if(!db.getSheetByName(n)){const sh=db.insertSheet(n);sh.appendRow(CFG.TABLES[n]);sh.setFrozenRows(1)}});return 'Presence tables ready'}
const PRESENCE_STATUSES=['在室','授業','昼食','実験室','帰宅','外出','オンライン会議','学生打ち合わせ','打ち合わせ','学内'];
function now_(){return new Date().toISOString()}
function presenceRows_(){return rows_('Presence')}
function currentPresence_(memberId){return presenceRows_().find(x=>x.memberId===memberId)}
function appendLog_(memberId,status,startedAt,endedAt,source){sheet_('PresenceLogs').appendRow([Utilities.getUuid(),memberId,status,startedAt,endedAt,source])}
function setPresence_(memberId,status,until,returnStatus,source){
 migrateV20();
 if(!PRESENCE_STATUSES.includes(status))throw Error('Invalid status');
 if(returnStatus&&!PRESENCE_STATUSES.includes(returnStatus))throw Error('Invalid return status');
 const previous=currentPresence_(memberId),time=now_();
 if(previous&&previous.updatedAt)appendLog_(memberId,previous.status,previous.updatedAt,time,source||'manual');
 const obj={id:previous?.id||Utilities.getUuid(),memberId,status,returnStatus:returnStatus||'',until:until||'',updatedAt:time,detail:''};
 const sh=sheet_('Presence'),cols=CFG.TABLES.Presence;
 if(previous){const ids=sh.getRange(2,1,sh.getLastRow()-1,1).getDisplayValues();const i=ids.findIndex(x=>x[0]===previous.id);if(i<0)throw Error('Presence record missing');sh.getRange(i+2,1,1,cols.length).setValues([cols.map(k=>obj[k]||'')])}
 else sh.appendRow(cols.map(k=>obj[k]||''));
 return obj;
}
/** v0.20: Add an optional detail to existing Presence sheets. Safe to rerun. */
function migrateV20(){const sh=sheet_('Presence');const headers=sh.getRange(1,1,1,sh.getLastColumn()).getDisplayValues()[0];if(!headers.includes('detail'))sh.getRange(1,sh.getLastColumn()+1).setValue('detail');return 'Presence detail ready';}
function apiSetPresenceDetail(status,detail){
 const u=user_();if(u.role!=='admin'&&!isLabMember_(u))throw Error('Permission denied');
 if(!['授業','学生打ち合わせ'].includes(status))throw Error('Invalid detailed status');
 detail=String(detail||'').trim().slice(0,160);
 if(!detail)throw Error('授業名または打ち合わせ相手を指定してください');
 const lock=LockService.getScriptLock();lock.waitLock(15000);
 try{migrateV20();const memberId=u.id||'ADMIN';const result=setPresence_(memberId,status,'','','self');const sh=sheet_('Presence');const headers=sh.getRange(1,1,1,sh.getLastColumn()).getDisplayValues()[0];const idcol=headers.indexOf('id')+1,detailcol=headers.indexOf('detail')+1;const ids=sh.getRange(2,idcol,sh.getLastRow()-1,1).getDisplayValues();const index=ids.findIndex(r=>r[0]===result.id);if(index<0)throw Error('Presence record missing');sh.getRange(index+2,detailcol).setValue(detail);result.detail=detail;return result;}
 finally{lock.releaseLock()}
}
function autoReturnPresence_(){const time=new Date();presenceRows_().forEach(p=>{if(p.until&&new Date(p.until)<=time){setPresence_(p.memberId,p.returnStatus||'在室','','','auto-return')}})}
function apiSetPresence(status,until,returnStatus){const u=user_();if(!isLabMember_(u)&&u.role!=='admin')throw Error('Only lab members can set presence');const memberId=u.id||'ADMIN';if(until){const date=new Date(until);if(isNaN(date)||date<=new Date()||date-new Date()>24*3600*1000)throw Error('Return time must be within 24 hours');until=date.toISOString()}return setPresence_(memberId,status,until,returnStatus,'self')}
/** One-tap check-in/out. Uses the same Presence and PresenceLogs tables. */
function apiAttendance(action){
 const u=user_();
 if(u.role!=='admin'&&!isLabMember_(u))throw Error('Only lab members can record attendance');
 if(!['checkin','checkout'].includes(action))throw Error('Invalid attendance action');
 const memberId=u.id||'ADMIN';
 const next=action==='checkin'?'在室':'帰宅';
 const lock=LockService.getScriptLock();lock.waitLock(15000);
 try{
   const current=currentPresence_(memberId);
   if(current&&current.status===next&&!current.until)return current;
   return setPresence_(memberId,next,'','',action);
 }finally{lock.releaseLock()}
}
function apiSetMemberPresence(memberId,status,until,returnStatus){const u=user_();if(u.role!=='admin')throw Error('Admin only');if(memberId!=='ADMIN'&&!rows_('Members').some(x=>x.id===memberId))throw Error('Unknown member');return setPresence_(memberId,status,until?new Date(until).toISOString():'',returnStatus,'admin')}
function entryAllowed_(status){return status==='在室';}
function apiPresence(){const u=user_();if(u.role!=='admin'&&!isLabMember_(u))throw Error('Permission denied');autoReturnPresence_();const members=rows_('Members').filter(x=>x.active!=='false'&&['student','staff'].includes(x.role));const current=presenceRows_();return {rows:members.map(m=>({memberId:m.id,name:m.name,nameJa:m.nameJa,nameEn:m.nameEn,grade:m.grade,...(current.find(p=>p.memberId===m.id)||{status:'未設定'})})),mine:current.find(p=>p.memberId===(u.id||'ADMIN'))||null,admin:current.find(p=>p.memberId==='ADMIN')||null,role:u.role}}
/** Admin-only historical logs. Never return raw logs to students. */
function apiPresenceReport(month){const u=user_();if(u.role!=='admin')throw Error('Admin only');if(!/^\d{4}-\d{2}$/.test(month))throw Error('Invalid month');autoReturnPresence_();const start=new Date(month+'-01T00:00:00+09:00');const [y,m]=month.split('-').map(Number);const end=new Date(new Date(Date.UTC(y,m,1)).getTime()-9*3600*1000);const now=new Date();const cut=now<end?now:end;const names=Object.fromEntries(rows_('Members').map(x=>[x.id,x.name]));const records=rows_('PresenceLogs').concat(presenceRows_().map(p=>({memberId:p.memberId,status:p.status,startedAt:p.updatedAt,endedAt:now_(),source:'current'})));const out={};records.forEach(x=>{const a=new Date(x.startedAt),b=new Date(x.endedAt);if(isNaN(a)||isNaN(b))return;const left=Math.max(a.getTime(),start.getTime()),right=Math.min(b.getTime(),cut.getTime());if(right<=left)return;const key=x.memberId;if(!out[key])out[key]={memberId:key,name:names[key]||'管理者',minutes:{},transitions:0};out[key].minutes[x.status]=(out[key].minutes[x.status]||0)+(right-left)/60000;out[key].transitions++});return Object.values(out).map(x=>({...x,minutes:Object.fromEntries(Object.entries(x.minutes).map(([k,v])=>[k,Math.round(v)]))}))}
/** desknet's NEO direct iCalendar (ICS) feed; no Google Calendar dependency. */
function setDesknetIcsUrl(url){
 if(user_().role!=='admin')throw Error('Admin only');
 const value=String(url||'').trim();
 if(value && (!/^https?:\/\//i.test(value)||value.length>2048||/\s/.test(value)))throw Error('HTTPまたはHTTPSのiCalendar (ICS) 予定取得URLを入力してください。通常のログイン画面URLでは予定を取得できません。');
 PropertiesService.getScriptProperties().setProperty('DESKNET_ICS_URL',value);
 return {saved:true,configured:!!value};
}
function desknetFeed_(){
 const url=PropertiesService.getScriptProperties().getProperty('DESKNET_ICS_URL');
 if(!url)throw Error('desknet\'s NEOのiCalendar (ICS) URLが未設定です。');
 const res=UrlFetchApp.fetch(url,{muteHttpExceptions:true,followRedirects:false,headers:{Accept:'text/calendar'}});
 if(res.getResponseCode()!==200)throw Error('予定データを取得できません (HTTP '+res.getResponseCode()+')。公開・購読用ICS URLを確認してください。');
 const body=res.getContentText('UTF-8');
 if(body.length>3000000||!/^BEGIN:VCALENDAR/m.test(body))throw Error('iCalendar形式のデータではありません。desknet\'s NEOのログインURLでは取得できません。');
 return body;
}
function desknetDate_(value,params){
 const v=String(value||'').trim();
 if(/^\d{8}$/.test(v))return new Date(v.slice(0,4)+'-'+v.slice(4,6)+'-'+v.slice(6,8)+'T00:00:00+09:00');
 const m=v.match(/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})?(Z)?$/);
 if(!m)return null;
 const iso=m[1]+'-'+m[2]+'-'+m[3]+'T'+m[4]+':'+m[5]+':'+(m[6]||'00');
 if(m[7])return new Date(iso+'Z');
 // desknet's NEO Japanese local feed (Asia/Tokyo). Reject other TZIDs to avoid false slots.
 const tz=(params.match(/TZID=([^;:]+)/i)||[])[1];
 if(tz&&!/^(Asia\/Tokyo|Japan)$/i.test(tz))throw Error('Asia/Tokyo以外のタイムゾーンには現在対応していません。');
 return new Date(iso+'+09:00');
}
function desknetEvents_(ics){
 const lines=ics.replace(/\r\n/g,'\n').replace(/\r/g,'\n').replace(/\n[ \t]/g,'').split('\n');
 const events=[];let ev=null;
 for(const line of lines){
  if(line==='BEGIN:VEVENT'){ev={};continue}
  if(line==='END:VEVENT'){if(ev)events.push(ev);ev=null;continue}
  if(!ev)continue;
  const pos=line.indexOf(':');if(pos<0)continue;
  const prop=line.slice(0,pos),key=prop.split(';')[0].toUpperCase(),value=line.slice(pos+1);
  if(key==='DTSTART'||key==='DTEND')ev[key]=desknetDate_(value,prop);
  if(key==='SUMMARY')ev.title=value.replace(/\\[,;nN]/g,' ');
  if(key==='RRULE')ev.recurring=true;
  if(key==='STATUS')ev.cancelled=value.toUpperCase()==='CANCELLED';
 }
 return events.filter(e=>e.DTSTART&&!e.cancelled);
}
function testDesknetIcsConnection(url){
 if(user_().role!=='admin')throw Error('Admin only');
 // Test the saved feed, not an arbitrary user-supplied URL.
 const events=desknetEvents_(desknetFeed_());
 return {ok:true,events:events.length,recurring:events.filter(e=>e.recurring).length};
}
/** v0.22: Register classes separately from manual presence. Run once after upgrade. */
function migrateV22(){const db=db_();if(!db.getSheetByName('ClassSchedules')){const sh=db.insertSheet('ClassSchedules');sh.appendRow(CFG.TABLES.ClassSchedules);sh.setFrozenRows(1);}return 'ClassSchedules ready';}
function apiClassSchedules(){const u=user_();if(u.role!=='admin'&&!isLabMember_(u))throw Error('Permission denied');migrateV22();return rows_('ClassSchedules').filter(x=>x.active!=='false');}
function migrateV26(){const db=db_();migrateV22();[['ClassSchedules',CFG.TABLES.ClassSchedules],['CourseCatalog',CFG.TABLES.CourseCatalog]].forEach(([name,cols])=>{let sh=db.getSheetByName(name);if(!sh){sh=db.insertSheet(name);sh.appendRow(cols);sh.setFrozenRows(1)}else{const old=sh.getRange(1,1,1,sh.getLastColumn()).getDisplayValues()[0];cols.filter(c=>!old.includes(c)).forEach(c=>sh.getRange(1,sh.getLastColumn()+1).setValue(c));}});return 'v0.26 ready';}
function apiCourseCatalog(){const u=user_();if(u.role!=='admin'&&!isLabMember_(u))throw Error('Permission denied');migrateV26();return rows_('CourseCatalog').filter(c=>c.active!=='false');}
function apiSaveCourse(title){if(user_().role!=='admin')throw Error('Admin only');migrateV26();title=String(title||'').trim();if(!title||title.length>100)throw Error('科目名を入力してください');const found=rows_('CourseCatalog').find(x=>x.title===title);if(found)return found;return apiSave('CourseCatalog',{title,active:'true'});}
function apiSaveClassSchedule(obj){if(user_().role!=='admin')throw Error('Admin only');migrateV26();const title=String(obj.title||'').trim(),start=String(obj.start||''),end=String(obj.end||''),weekday=String(obj.weekday||''),repeatType=String(obj.repeatType||'weekly'),repeatCount=Number(obj.repeatCount||1);if(!title||!/^([01]\d|2[0-3]):[0-5]\d$/.test(start)||!/^([01]\d|2[0-3]):[0-5]\d$/.test(end)||end<=start||!/^[0-6]$/.test(weekday))throw Error('科目名・曜日・時刻を確認してください');if(!/^\d{4}-\d{2}-\d{2}$/.test(obj.startDate||''))throw Error('初回授業日を指定してください');if(!['once','weekly','count'].includes(repeatType)||!Number.isInteger(repeatCount)||repeatCount<1||repeatCount>60)throw Error('繰り返し設定を確認してください');if(obj.endDate&&obj.endDate<obj.startDate)throw Error('終了日が開始日より前です');const first=new Date(obj.startDate+'T12:00:00+09:00');if(first.getDay()!==Number(weekday))throw Error('初回授業日と曜日が一致していません');return apiSave('ClassSchedules',{id:obj.id||'',title,weekday,start,end,startDate:obj.startDate,endDate:obj.endDate||'',repeatType,repeatCount:String(repeatCount),active:'true'});}
function apiDisableClassSchedule(id){const u=user_();if(u.role!=='admin')throw Error('Admin only');migrateV22();const r=rows_('ClassSchedules').find(x=>x.id===id);if(!r)throw Error('授業が見つかりません');return apiSave('ClassSchedules',{...r,active:'false'});}
function localDateTime_(date,hhmm){return new Date(date+'T'+hhmm+':00+09:00');}
function professorInternalEvents_(start,end){
 migrateV22();const names=Object.fromEntries(rows_('Members').map(x=>[x.id,x.name]));const items=[];
 rows_('Meetings').forEach(m=>{if(!m.date||!m.start||!m.end)return;const a=localDateTime_(m.date,m.start),b=localDateTime_(m.date,m.end);if(isNaN(a)||isNaN(b)||b<=start||a>=end||b<=a)return;const people=String(m.participants||'').split(',').map(id=>names[id]).filter(Boolean);items.push({a,b,type:'meeting',label:'学生打ち合わせ',detail:people.join('・')||'参加者未登録'});});
 const classes=rows_('ClassSchedules').filter(x=>x.active!=='false');for(let i=0;i<Math.round((end-start)/86400000);i++){const d=new Date(start.getTime()+i*86400000),date=Utilities.formatDate(d,CFG.TZ,'yyyy-MM-dd'),weekday=new Date(date+'T12:00:00+09:00').getUTCDay();classes.forEach(c=>{if(Number(c.weekday)!==weekday||(c.startDate&&date<c.startDate)||(c.endDate&&date>c.endDate))return;
const first=c.startDate||date, weeks=Math.floor((new Date(date+'T12:00:00+09:00')-new Date(first+'T12:00:00+09:00'))/(7*86400000));if(c.repeatType==='once'&&date!==first)return;if(c.repeatType==='count'&&(weeks<0||weeks>=Number(c.repeatCount||1)))return;const a=localDateTime_(date,c.start),b=localDateTime_(date,c.end);if(b>a)items.push({a,b,type:'class',label:'授業',detail:c.title});});}return items;
}
function apiProfessorSchedule(startDate,requestedDays){
 const u=user_();if(u.role!=='admin'&&!isLabMember_(u))throw Error('Permission denied');
 const manual=currentPresence_('ADMIN');
 const today=Utilities.formatDate(new Date(),CFG.TZ,'yyyy-MM-dd');
 const chosen=String(startDate||today),daysCount=Number(requestedDays||7);
 if(!/^\d{4}-\d{2}-\d{2}$/.test(chosen)||!Number.isInteger(daysCount)||![7,14,30].includes(daysCount))throw Error('表示期間が正しくありません');
 const start=new Date(chosen+'T00:00:00+09:00');
 if(isNaN(start.getTime())||Utilities.formatDate(start,CFG.TZ,'yyyy-MM-dd')!==chosen)throw Error('開始日が正しくありません');
 const limit=new Date(today+'T00:00:00+09:00');
 if(start<limit||start.getTime()>limit.getTime()+365*86400000)throw Error('開始日は今日から1年以内で指定してください');
 const end=new Date(start.getTime()+daysCount*86400000);
 const internal=professorInternalEvents_(start,end);
 const days=Array.from({length:daysCount},(_,i)=>({date:Utilities.formatDate(new Date(start.getTime()+i*86400000),CFG.TZ,'yyyy-MM-dd'),segments:[]}));
 let connected=false,error='';
 try{
  const events=desknetEvents_(desknetFeed_());connected=true;
  events.forEach(ev=>{
   if(ev.recurring)return; // Recurring master needs expansion; do not show misleading occurrences.
   const a=Math.max(start.getTime(),ev.DTSTART.getTime());
   const b=Math.min(end.getTime(),(ev.DTEND||new Date(ev.DTSTART.getTime()+3600000)).getTime());
   if(b<=a)return;
   const trip=/(出張|海外渡航|business\s*trip|travel\s*for\s*work)/i.test(ev.title||'');
   days.forEach((day,i)=>{const t=start.getTime()+i*86400000,left=Math.max(a,t),right=Math.min(b,t+86400000);if(right>left)day.segments.push({startMinute:Math.round((left-t)/60000),endMinute:Math.round((right-t)/60000),type:trip?'trip':'busy'});});
  });
  days.forEach(day=>{const bounds=[...new Set([0,1440,...day.segments.flatMap(x=>[x.startMinute,x.endMinute])])].sort((a,b)=>a-b),out=[];
   for(let i=0;i<bounds.length-1;i++){const a=bounds[i],b=bounds[i+1],cover=day.segments.filter(x=>x.startMinute<b&&x.endMinute>a);if(!cover.length)continue;const type=cover.some(x=>x.type==='trip')?'trip':'busy',last=out[out.length-1];if(last&&last.type===type&&last.endMinute===a)last.endMinute=b;else out.push({startMinute:a,endMinute:b,type});}day.segments=out;});
  if(events.some(e=>e.recurring))error='繰り返し予定の一部は表示されません（ICSの繰り返し展開は未対応）。';
 }catch(e){connected=false;error=String(e.message||e).slice(0,250);}
 internal.forEach(ev=>{days.forEach((day,i)=>{const t=start.getTime()+i*86400000,a=Math.max(t,ev.a.getTime()),b=Math.min(t+86400000,ev.b.getTime());if(b>a)day.segments.push({startMinute:Math.round((a-t)/60000),endMinute:Math.round((b-t)/60000),type:ev.type});});});
 const activeInternal=internal.filter(x=>x.a<=new Date()&&new Date()<x.b).sort((a,b)=>(a.type==='class'?0:1)-(b.type==='class'?0:1))[0];
 return {connected,error,days,rangeStart:chosen,rangeDays:daysCount,internalConnected:true,activeInternal:activeInternal?{status:activeInternal.label,detail:activeInternal.detail}:null,manual:manual?{status:manual.status,until:manual.until,detail:manual.detail||''}:null,timezone:CFG.TZ,now:new Date().toISOString()};
}

// v0.3: Administrator-maintained document library. This is a prototype: Drive ACLs must
// be configured independently before multi-user release.
function migrateV03(){
  const db=db_();if(!db.getSheetByName('LabDocuments')){const sh=db.insertSheet('LabDocuments');sh.appendRow(CFG.TABLES.LabDocuments);sh.setFrozenRows(1)}
  folder_(root_(),'06_Lab_Documents');return 'Lab Documents ready';
}
function uploadLabDocument(data){
  const u=user_();if(u.role!=='admin')throw Error('Administrator only');
  const title=String(data.title||'').trim(),category=String(data.category||'').trim();
  if(!title||title.length>180||!category||category.length>80)throw Error('Title/category required');
  const visibility=String(data.visibility||'lab');if(!['lab','collaborators','admin'].includes(visibility))throw Error('Invalid visibility');
  const ext=String(data.filename||'').split('.').pop().toLowerCase();if(ext!=='pdf')throw Error('Only PDF is supported');
  const bytes=Utilities.base64Decode(data.base64||'');if(bytes.length>8*1024*1024)throw Error('PDF exceeds 8 MB');
  const previous=rows_('LabDocuments').filter(x=>x.title===title&&x.category===category);
  const version=previous.length+1;
  const safe=title.replace(/[\\/:*?"<>|]/g,'_').slice(0,90);
  const folder=folder_(folder_(root_(),'06_Lab_Documents'),category.replace(/[\\/:*?"<>|]/g,'_'));
  const filename=`${safe}_v${String(version).padStart(2,'0')}.pdf`;
  const file=folder.createFile(Utilities.newBlob(bytes,'application/pdf',filename));
  return apiSave('LabDocuments',{title,category,description:String(data.description||'').slice(0,1000),visibility,fileId:file.getId(),fileName:filename,version,uploadedAt:new Date().toISOString(),active:'true',sortOrder:(Math.max(0,...rows_('LabDocuments').map(x=>Number(x.sortOrder)||0))+10)});
}
function apiLabDocumentUrl(id){
  const u=user_(),d=rows_('LabDocuments').find(x=>x.fileId===id);
  if(!d||d.active==='false')throw Error('Document not found');
  if(u.role!=='admin'&&(d.visibility!=='lab'||u.role==='collaborator')&&!(u.role==='collaborator'&&d.visibility==='collaborators'))throw Error('Permission denied');
  return DriveApp.getFileById(id).getUrl();
}

// v0.4: Ordered lab document library. Existing rows receive a stable initial order.
function migrateV04(){
  migrateV03();const sh=sheet_('LabDocuments');const heads=sh.getRange(1,1,1,sh.getLastColumn()).getValues()[0];
  if(!heads.includes('sortOrder'))sh.getRange(1,heads.length+1).setValue('sortOrder');
  const idx=sh.getRange(1,1,1,sh.getLastColumn()).getValues()[0].indexOf('sortOrder')+1;
  if(sh.getLastRow()>1){const range=sh.getRange(2,idx,sh.getLastRow()-1,1);const vals=range.getValues();range.setValues(vals.map((v,i)=>[v[0]!==''?v[0]:(i+1)*10]));}
  return 'Lab Documents ordering ready';
}
function apiReorderLabDocuments(ids){
  if(user_().role!=='admin')throw Error('Administrator only');
  if(!Array.isArray(ids)||ids.length>2000)throw Error('Invalid order');
  const sh=sheet_('LabDocuments'),all=rows_('LabDocuments');
  const valid=all.map(x=>x.id);if(ids.length!==valid.length||new Set(ids).size!==ids.length||ids.some(id=>!valid.includes(id)))throw Error('Incomplete document order');
  const header=sh.getRange(1,1,1,sh.getLastColumn()).getValues()[0];const c=header.indexOf('sortOrder')+1;
  if(!c)throw Error('Run migrateV04() first');
  const rank=Object.fromEntries(ids.map((id,i)=>[id,(i+1)*10]));
  const idRows=sh.getRange(2,1,sh.getLastRow()-1,1).getDisplayValues();
  sh.getRange(2,c,idRows.length,1).setValues(idRows.map(x=>[rank[x[0]]]));
  return true;
}

/** Invite-only member management. Registration is NOT an email invitation; admin sends the app URL. */
function apiInviteMember(data){
 const u=user_();if(u.role!=='admin')throw Error('Admin only');
 const email=String(data.email||'').trim().toLowerCase();
 if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))throw Error('Valid Google account email required');
 const nameJa=String(data.nameJa||'').trim(),nameEn=String(data.nameEn||'').trim();const name=nameJa||nameEn;if(!name)throw Error('Enter a Japanese or English name');
 const role=String(data.role||'student');if(!['student','staff','collaborator'].includes(role))throw Error('Invalid role');
 if(email===(PropertiesService.getScriptProperties().getProperty('ADMIN_EMAIL')||'').toLowerCase())throw Error('Administrator is configured separately');
 if(rows_('Members').some(m=>String(m.email).toLowerCase()===email))throw Error('This address is already registered; edit its existing record');
 return apiSave('Members',{name,nameJa,nameEn,email,role,grade:String(data.grade||'External'),active:'true'});
}
function apiSetMemberAccess(id,active){
 const u=user_();if(u.role!=='admin')throw Error('Admin only');
 const m=rows_('Members').find(x=>x.id===id);if(!m)throw Error('Member not found');
 return apiSave('Members',{id,active:active?'true':'false'});
}

/** v0.6: Seminars. Existing deployments must run migrateV06() once. */
function migrateV06(){migrateV04();const db=db_();['Seminars','SeminarPresentations','SeminarFiles','SeminarComments'].forEach(n=>{if(!db.getSheetByName(n)){const sh=db.insertSheet(n);sh.appendRow(CFG.TABLES[n]);sh.setFrozenRows(1)}});folder_(root_(),'07_Seminars');return 'v0.6 tables ready'}
const SEMINAR_GROUPS=['ALL','B4','M1','M2','D1','D2','D3'];
function apiCreateSeminar(d){if(user_().role!=='admin')throw Error('Admin only');const groups=String(d.groups||'').split(',').filter(Boolean);if(!groups.length||groups.some(x=>!SEMINAR_GROUPS.includes(x)))throw Error('Invalid seminar groups');if(!/^\d{4}-\d{2}-\d{2}$/.test(d.date)||!/^\d{2}:\d{2}$/.test(d.start)||!/^\d{2}:\d{2}$/.test(d.end)||d.end<=d.start)throw Error('Invalid date/time');const previous=rows_('Seminars').filter(x=>x.groups===groups.join(',')&&x.date<d.date).sort((a,b)=>b.date.localeCompare(a.date))[0];return apiSave('Seminars',{date:d.date,start:d.start,end:d.end,location:String(d.location||''),method:String(d.method||'in-person'),groups:groups.join(','),title:String(d.title||'Seminar'),previousMinutesId:previous?.minutesFileId||''})}
function apiAddSeminarPresenter(seminarId,memberId,title){if(user_().role!=='admin')throw Error('Admin only');if(!rows_('Seminars').some(x=>x.id===seminarId)||!rows_('Members').some(x=>x.id===memberId))throw Error('Unknown seminar/member');const existing=rows_('SeminarPresentations').filter(x=>x.seminarId===seminarId);if(existing.some(x=>x.memberId===memberId))throw Error('Already assigned');return apiSave('SeminarPresentations',{seminarId,memberId,title:String(title||''),position:existing.length+1})}
function apiReorderSeminarPresenters(seminarId,ids){seminarAccess_(seminarId,true);const rows=rows_('SeminarPresentations').filter(x=>x.seminarId===seminarId);if(ids.length!==rows.length||new Set(ids).size!==ids.length||ids.some(x=>!rows.some(y=>y.id===x)))throw Error('Invalid order');ids.forEach((id,i)=>apiSave('SeminarPresentations',{id,position:i+1}));return true}
function safeToken_(x){return String(x||'').replace(/[^A-Za-z0-9]/g,'').slice(0,40)||'Member'}
function apiUploadSeminarPdf(d){const u=user_(),sem=rows_('Seminars').find(x=>x.id===d.seminarId);if(!sem||u.role==='collaborator')throw Error('Not permitted');seminarAccess_(sem.id,true);const kind=String(d.kind||'presentation');if(!['agenda','minutes','presentation'].includes(kind))throw Error('Invalid kind');const pres=kind==='presentation'?rows_('SeminarPresentations').find(x=>x.id===d.presentationId&&x.seminarId===sem.id):null;if(kind==='presentation'&&!pres)throw Error('Presenter not found');if(u.role!=='admin'&&(kind!=='presentation'||pres.memberId!==u.id))throw Error('Permission denied');const bytes=Utilities.base64Decode(d.base64||'');if(bytes.length>8*1024*1024||bytes.length<5||String(d.filename||'').split('.').pop().toLowerCase()!=='pdf')throw Error('PDF only, max 8 MB');const files=rows_('SeminarFiles').filter(x=>x.seminarId===sem.id&&x.kind===kind&&x.presentationId===(pres?.id||''));const ver=files.length+1;const presenters=rows_('SeminarPresentations').filter(x=>x.seminarId===sem.id).sort((a,b)=>Number(a.position)-Number(b.position));const seq=kind==='agenda'?0:kind==='minutes'?1:presenters.findIndex(x=>x.id===pres.id)+2;const group=sem.groups==='ALL'?'ALL':safeToken_(sem.groups.replace(/,/g,'_'));const stem=[sem.date.replace(/-/g,''),group,String(seq).padStart(2,'0'),kind==='presentation'?safeToken_(pres.memberId):kind==='agenda'?'Agenda':'Minutes','v'+String(ver).padStart(2,'0')].join('_');const name=stem+'.pdf';let folder=folder_(root_(),'07_Seminars');for(const seg of [sem.date.slice(0,4),safeToken_(group),safeToken_(sem.id)])folder=folder_(folder,seg);const file=folder.createFile(Utilities.newBlob(bytes,'application/pdf',name));const rec=apiSave('SeminarFiles',{seminarId:sem.id,presentationId:pres?.id||'',kind,memberId:pres?.memberId||u.id||'ADMIN',fileId:file.getId(),fileName:name,version:ver,uploadedAt:now_()});if(kind==='minutes')apiSave('Seminars',{id:sem.id,minutesFileId:file.getId()});if(kind==='agenda')apiSave('Seminars',{id:sem.id,agendaFileId:file.getId()});return rec}
function apiSeminarFileUrl(id){const u=user_();if(u.role==='collaborator')throw Error('Permission denied');const f=rows_('SeminarFiles').find(x=>x.fileId===id);if(!f)throw Error('Not found');return DriveApp.getFileById(id).getUrl()}
function apiAddSeminarComment(presentationId,fileId,body){const u=user_();if(u.role==='collaborator')throw Error('Permission denied');const p=rows_('SeminarPresentations').find(x=>x.id===presentationId);if(p)seminarAccess_(p.seminarId,true);const f=rows_('SeminarFiles').find(x=>x.fileId===fileId&&x.presentationId===presentationId);if(!p||!f||!String(body||'').trim())throw Error('Invalid comment');return apiSave('SeminarComments',{seminarId:p.seminarId,presentationId,fileId,authorId:u.id||'ADMIN',body:String(body).slice(0,2000),status:'open',createdAt:now_()})}


/** v0.7: seminar inline minutes/agenda, presenter time slots and finalization. */
function migrateV07(){
 migrateV06();const db=db_();
 for(const table of ['Seminars','SeminarPresentations']){
  const sh=db.getSheetByName(table),head=sh.getRange(1,1,1,sh.getLastColumn()).getDisplayValues()[0];
  CFG.TABLES[table].forEach(k=>{if(!head.includes(k)){sh.getRange(1,sh.getLastColumn()+1).setValue(k);head.push(k)}});
 }
 return 'v0.7 seminar fields ready';
}
function seminarAccess_(id,write){
 const u=user_(),sem=rows_('Seminars').find(x=>x.id===id);
 if(!sem||u.role==='collaborator')throw Error('Seminar not available');
 if(write&&sem.locked==='true'&&u.role!=='admin')throw Error('This seminar is finalized. Only the administrator can edit it.');
 return {u,sem};
}
function apiEditSeminarText(id,kind,body){
 const {sem}=seminarAccess_(id,true);
 if(!['agendaText','minutesText'].includes(kind))throw Error('Invalid field');
 if(String(body||'').length>20000)throw Error('Text too long');
 return apiSaveSeminarInternal_(sem.id,{[kind]:String(body||'')});
}
function apiSaveSeminarInternal_(id,patch){
 const sh=sheet_('Seminars'),cols=sh.getRange(1,1,1,sh.getLastColumn()).getDisplayValues()[0];
 const old=rows_('Seminars').find(x=>x.id===id);if(!old)throw Error('Seminar missing');
 const ids=sh.getRange(2,1,Math.max(1,sh.getLastRow()-1),1).getDisplayValues();const pos=ids.findIndex(x=>x[0]===id);if(pos<0)throw Error('Seminar missing');
 const value={...old,...patch};sh.getRange(pos+2,1,1,cols.length).setValues([cols.map(k=>String(value[k]??''))]);return value;
}
function apiSetSeminarLocked(id,locked){
 if(user_().role!=='admin')throw Error('Admin only');
 seminarAccess_(id,false);return apiSaveSeminarInternal_(id,{locked:locked?'true':'false'});
}
function apiSetSeminarPresenters(id,presenters){
 const {sem}=seminarAccess_(id,true);
 if(!Array.isArray(presenters)||presenters.length>60)throw Error('Invalid presenters');
 const members=rows_('Members'),old=rows_('SeminarPresentations').filter(x=>x.seminarId===id);
 const ids=new Set();
 for(let i=0;i<presenters.length;i++){
  const x=presenters[i];
  if(!members.some(m=>m.id===x.memberId))throw Error('Invalid presenter');
  const duration=Number(x.durationMinutes);if(!Number.isInteger(duration)||duration<1||duration>240)throw Error('Duration must be 1–240 minutes');
  if(x.id&&(!old.some(o=>o.id===x.id&&o.memberId===x.memberId)||ids.has(x.id)))throw Error('Invalid presenter ID');
  if(x.id)ids.add(x.id);
 }
 if(presenters.reduce((sum,x)=>sum+Number(x.durationMinutes),0)>seminarMinutes_(sem.end)-seminarMinutes_(sem.start))throw Error('Total presentation duration exceeds seminar end time');
 // Keep historical records; do not delete presentations with attached files/comments.
 for(const x of old){if(!ids.has(x.id)&&rows_('SeminarFiles').some(f=>f.presentationId===x.id))throw Error('Cannot remove a presenter with uploaded files');}
 const sh=sheet_('SeminarPresentations');const cols=sh.getRange(1,1,1,sh.getLastColumn()).getDisplayValues()[0];
 const idCol=cols.indexOf('id');
 for(const x of old.filter(o=>!ids.has(o.id))){const data=sh.getRange(2,1,sh.getLastRow()-1,cols.length).getDisplayValues();const idx=data.findIndex(r=>r[idCol]===x.id);if(idx>=0)sh.deleteRow(idx+2)}
 let cursor=seminarMinutes_(sem.start);const seminarEnd=seminarMinutes_(sem.end);
 presenters.forEach((x,i)=>{
  const duration=Number(x.durationMinutes);const start=cursor;cursor+=duration;if(cursor>seminarEnd)throw Error('Total presentation duration exceeds seminar end time');
  const payload={id:x.id||Utilities.getUuid(),seminarId:id,memberId:x.memberId,title:String(x.title||'').slice(0,300),position:i+1,start:seminarClock_(start),end:seminarClock_(cursor),durationMinutes:duration,createdAt:old.find(o=>o.id===x.id)?.createdAt||now_()};
  const data=sh.getRange(2,1,Math.max(1,sh.getLastRow()-1),cols.length).getDisplayValues();const idx=data.findIndex(r=>r[idCol]===payload.id);
  if(idx>=0)sh.getRange(idx+2,1,1,cols.length).setValues([cols.map(k=>String(payload[k]??''))]);else sh.appendRow(cols.map(k=>String(payload[k]??'')));
 });return true;
}
function apiSaveSeminarComment(presentationId,body){
 const p=rows_('SeminarPresentations').find(x=>x.id===presentationId);if(!p)throw Error('Presentation not found');
 const {u}=seminarAccess_(p.seminarId,true);
 if(!String(body||'').trim())throw Error('Comment required');
 const f=rows_('SeminarFiles').filter(x=>x.presentationId===p.id).sort((a,b)=>Number(b.version)-Number(a.version))[0];
 const sh=sheet_('SeminarComments'),cols=sh.getRange(1,1,1,sh.getLastColumn()).getDisplayValues()[0];
 const obj={id:Utilities.getUuid(),seminarId:p.seminarId,presentationId:p.id,fileId:f?.fileId||'',authorId:u.id||'ADMIN',body:String(body).slice(0,2000),status:'open',createdAt:now_()};
 sh.appendRow(cols.map(k=>String(obj[k]??'')));return obj;
}

/** v0.8: auto scheduling based on presenter duration and order. */
function seminarMinutes_(time){const m=/^(\d{2}):(\d{2})$/.exec(String(time));if(!m||Number(m[1])>23||Number(m[2])>59)throw Error('Invalid seminar time');return Number(m[1])*60+Number(m[2]);}
function seminarClock_(minutes){return String(Math.floor(minutes/60)).padStart(2,'0')+':'+String(minutes%60).padStart(2,'0');}
function migrateV08(){migrateV07();const sh=sheet_('SeminarPresentations');const heads=sh.getRange(1,1,1,sh.getLastColumn()).getDisplayValues()[0];if(!heads.includes('durationMinutes'))sh.getRange(1,sh.getLastColumn()+1).setValue('durationMinutes');const cols=sh.getRange(1,1,1,sh.getLastColumn()).getDisplayValues()[0];const durCol=cols.indexOf('durationMinutes')+1;const rows=rows_('SeminarPresentations');rows.forEach((r,i)=>{if(r.durationMinutes)return;const a=/^\d{2}:\d{2}$/.test(r.start)?seminarMinutes_(r.start):0,b=/^\d{2}:\d{2}$/.test(r.end)?seminarMinutes_(r.end):0;sh.getRange(i+2,durCol).setValue(b>a?b-a:20)});return 'v0.8 presenter durations ready';}


/** v0.9 — live seminar, audit trail, scribe notes, approval. */
function migrateV09(){migrateV08();const db=db_();for(const name of ['SeminarEvents','SeminarNotes']){if(!db.getSheetByName(name)){const sh=db.insertSheet(name);sh.appendRow(CFG.TABLES[name]);sh.setFrozenRows(1)}}const sh=sheet_('Seminars'),head=sh.getRange(1,1,1,sh.getLastColumn()).getDisplayValues()[0];for(const k of ['liveStatus','scribeId','minutesApprovedAt'])if(!head.includes(k)){sh.getRange(1,sh.getLastColumn()+1).setValue(k);head.push(k)}return 'v0.9 live seminar tables ready';}
function seminarEvents_(id){return rows_('SeminarEvents').filter(x=>x.seminarId===id).sort((a,b)=>a.createdAt.localeCompare(b.createdAt));}
function apiSeminarLive(id){const {sem}=seminarAccess_(id,false);return {seminar:sem,events:seminarEvents_(id),notes:rows_('SeminarNotes').filter(x=>x.seminarId===id)};}
function apiSetSeminarScribe(id,memberId){const {u,sem}=seminarAccess_(id,true);if(u.role!=='admin')throw Error('Admin only');if(memberId&&!rows_('Members').some(x=>x.id===memberId&&x.active!=='false'))throw Error('Unknown member');return apiSaveSeminarInternal_(id,{scribeId:memberId||''});}
function apiSeminarEvent(id,type,presentationId){
 const {u,sem}=seminarAccess_(id,true);if(u.role!=='admin')throw Error('Only administrator can control the live timer');
 const valid=['seminar_start','presentation_start','presentation_end','break_start','break_end','seminar_end'];if(!valid.includes(type))throw Error('Invalid event');
 const events=seminarEvents_(id),last=events[events.length-1],status=sem.liveStatus||'ready';
 const current=()=>{let active='';for(const e of events){if(e.type==='presentation_start')active=e.presentationId;if(e.type==='presentation_end')active='';}return active};
 const breakActive=(()=>{let b=false;for(const e of events){if(e.type==='break_start')b=true;if(e.type==='break_end')b=false}return b})();
 const active=current();
 if(type==='seminar_start'&&status!=='ready')throw Error('Seminar already started');
 if(type!=='seminar_start'&&status!=='running')throw Error('Seminar is not running');
 if(type==='presentation_start'){if(active||breakActive)throw Error('Finish current segment first');const ps=rows_('SeminarPresentations').filter(x=>x.seminarId===id);if(!ps.some(x=>x.id===presentationId))throw Error('Invalid presenter');if(events.some(x=>x.type==='presentation_start'&&x.presentationId===presentationId))throw Error('Presenter already started')}
 if(type==='presentation_end'&&(!active||active!==presentationId))throw Error('Presenter is not active');
 if(type==='break_start'&&(active||breakActive))throw Error('Cannot start break');
 if(type==='break_end'&&!breakActive)throw Error('No active break');
 if(type==='seminar_end'&&(active||breakActive))throw Error('Finish presentation or break first');
 const at=now_(),ev={id:Utilities.getUuid(),seminarId:id,presentationId:presentationId||'',type,at,actorId:u.id||'ADMIN',createdAt:at};
 const sh=sheet_('SeminarEvents');sh.appendRow(CFG.TABLES.SeminarEvents.map(k=>String(ev[k]??'')));
 if(type==='seminar_start'||type==='seminar_end')apiSaveSeminarInternal_(id,{liveStatus:type==='seminar_start'?'running':'ended'});
 return apiSeminarLive(id);
}
function apiSeminarAddNote(id,presentationId,kind,body,assigneeId,dueDate){
 const {u,sem}=seminarAccess_(id,true);if(u.role!=='admin'&&u.id!==sem.scribeId)throw Error('Only administrator or designated scribe may write minutes');
 if(!['question','task','memo'].includes(kind)||!String(body||'').trim()||String(body).length>4000)throw Error('Invalid note');
 if(presentationId&&!rows_('SeminarPresentations').some(x=>x.seminarId===id&&x.id===presentationId))throw Error('Invalid presentation');
 if(kind==='task'&&assigneeId&&!rows_('Members').some(x=>x.id===assigneeId))throw Error('Unknown assignee');
 if(dueDate&&!/^\d{4}-\d{2}-\d{2}$/.test(dueDate))throw Error('Invalid due date');
 const now=now_(),obj={id:Utilities.getUuid(),seminarId:id,presentationId:presentationId||'',kind,body:String(body),assigneeId:kind==='task'?(assigneeId||''):'',dueDate:kind==='task'?(dueDate||''):'',status:'open',authorId:u.id||'ADMIN',createdAt:now,updatedAt:now};sheet_('SeminarNotes').appendRow(CFG.TABLES.SeminarNotes.map(k=>String(obj[k]??'')));return obj;
}
function apiSeminarTaskStatus(id,status){const u=user_(),n=rows_('SeminarNotes').find(x=>x.id===id);if(!n||n.kind!=='task'||!['open','in_progress','done'].includes(status))throw Error('Invalid task');seminarAccess_(n.seminarId,false);if(u.role!=='admin'&&u.id!==n.assigneeId)throw Error('Permission denied');const sh=sheet_('SeminarNotes'),all=rows_('SeminarNotes'),index=all.findIndex(x=>x.id===id),cols=sh.getRange(1,1,1,sh.getLastColumn()).getDisplayValues()[0];const value={...n,status,updatedAt:now_()};sh.getRange(index+2,1,1,cols.length).setValues([cols.map(k=>String(value[k]??''))]);return value;}
function apiSeminarMinutesPreview(id){const {sem}=seminarAccess_(id,false),events=seminarEvents_(id),notes=rows_('SeminarNotes').filter(x=>x.seminarId===id),ps=rows_('SeminarPresentations').filter(x=>x.seminarId===id).sort((a,b)=>Number(a.position)-Number(b.position)),names=Object.fromEntries(rows_('Members').map(m=>[m.id,m.name]));const time=x=>x?Utilities.formatDate(new Date(x),CFG.TZ,'HH:mm:ss'):'—';let lines=[sem.title+' / '+sem.date,sem.location+' | '+sem.start+'–'+sem.end,'', '【実際の進行 / Actual timeline】'];for(const e of events)lines.push(time(e.at)+' '+({seminar_start:'ゼミ開始',presentation_start:'発表開始',presentation_end:'発表終了',break_start:'休憩開始',break_end:'休憩終了',seminar_end:'ゼミ終了'}[e.type]||e.type)+(e.presentationId?' · '+(names[ps.find(p=>p.id===e.presentationId)?.memberId]||''):''));for(const p of ps){const a=events.find(e=>e.type==='presentation_start'&&e.presentationId===p.id),b=events.find(e=>e.type==='presentation_end'&&e.presentationId===p.id);lines.push('',names[p.memberId]||p.memberId+' · '+p.title,'予定 '+p.start+'–'+p.end+' / 実績 '+time(a?.at)+'–'+time(b?.at)+(a&&b?' ('+Math.round((new Date(b.at)-new Date(a.at))/60000)+'分)':''));for(const n of notes.filter(n=>n.presentationId===p.id))lines.push('・'+({question:'質疑',task:'課題',memo:'メモ'}[n.kind])+'：'+n.body+(n.assigneeId?' ['+(names[n.assigneeId]||'')+']':''));}for(const n of notes.filter(n=>!n.presentationId))lines.push('・'+n.body);return lines.join('\n');}
function apiApproveSeminarMinutes(id){const {u,sem}=seminarAccess_(id,false);if(u.role!=='admin')throw Error('Admin only');if(sem.liveStatus!=='ended')throw Error('End seminar before approval');const minutes=apiSeminarMinutesPreview(id);return apiSaveSeminarInternal_(id,{minutesText:minutes,minutesApprovedAt:now_(),locked:'true'});}


/** Latest journal articles (Crossref). Separate from lab Publications. */
const LATEST_DEFAULT_JOURNALS_ = [
 {name:'Engineering Structures',issn:'0141-0296'},
 {name:'Composite Structures',issn:'0263-8223'},
 {name:'Journal of Bridge Engineering',issn:'1084-0702'},
 {name:'Structure and Infrastructure Engineering',issn:'1573-2479'},
 {name:'Journal of Composites for Construction',issn:'1943-5614'},
 {name:'Journal of Constructional Steel Research',issn:'0143-974X'},
 {name:'Thin-Walled Structures',issn:'0263-8231'},
 {name:'Journal of Civil Structural Health Monitoring',issn:'2190-5479'},
 {name:'International Journal of Steel Structures',issn:'1598-2351'}
];
/** Adds new default journals once to existing installations without deleting custom journals. */
function latestJournals_(){
 const p=PropertiesService.getScriptProperties();
 const raw=p.getProperty('LATEST_JOURNALS');
 let journals;
 try{journals=raw?JSON.parse(raw):LATEST_DEFAULT_JOURNALS_.slice()}catch(e){journals=LATEST_DEFAULT_JOURNALS_.slice()}
 if(!Array.isArray(journals))journals=LATEST_DEFAULT_JOURNALS_.slice();
 if(p.getProperty('LATEST_JOURNALS_V29_MERGED')!=='yes'){
  const seen=new Set(journals.map(j=>String(j.issn||'').toUpperCase()));
  LATEST_DEFAULT_JOURNALS_.forEach(j=>{if(!seen.has(j.issn.toUpperCase())){journals.push(j);seen.add(j.issn.toUpperCase())}});
  p.setProperty('LATEST_JOURNALS',JSON.stringify(journals));
  p.setProperty('LATEST_JOURNALS_V29_MERGED','yes');
 }
 return journals;
}
function apiLatestJournals(){user_();return latestJournals_()}
function apiLatestAddJournal(name,issn){if(user_().role!=='admin')throw Error('Admin only');name=String(name||'').trim();issn=String(issn||'').trim().toUpperCase();if(!name||name.length>160||!/^[0-9]{4}-[0-9]{3}[0-9X]$/.test(issn))throw Error('雑誌名と正しいISSNを入力してください');const a=latestJournals_();if(a.some(x=>x.issn===issn))throw Error('登録済みです');a.push({name,issn});PropertiesService.getScriptProperties().setProperty('LATEST_JOURNALS',JSON.stringify(a));return a}
function apiLatestRemoveJournal(issn){if(user_().role!=='admin')throw Error('Admin only');const a=latestJournals_().filter(x=>x.issn!==issn);PropertiesService.getScriptProperties().setProperty('LATEST_JOURNALS',JSON.stringify(a));return a}
function latestDate_(x){const a=x&&x['published-online']||x&&x.published||x&&x.issued||x&&x['published-print'];const parts=a&&a['date-parts']&&a['date-parts'][0];if(!parts||!parts[0])return '';return [parts[0],String(parts[1]||1).padStart(2,'0'),String(parts[2]||1).padStart(2,'0')].join('-')}
function apiLatestResearch(days,force){const u=user_();days=Number(days);if(![7,30,90].includes(days))throw Error('Invalid period');if(force&&u.role!=='admin')throw Error('Admin only');const journals=latestJournals_(),cache=CacheService.getScriptCache();const from=new Date(Date.now()-days*86400000).toISOString().slice(0,10);const out=[];const errors=[];for(const j of journals){const key='latest_v1_'+j.issn+'_'+days;let records=null;if(!force){const cached=cache.get(key);if(cached){try{records=JSON.parse(cached)}catch(e){}}}if(!records){try{const url='https://api.crossref.org/journals/'+encodeURIComponent(j.issn)+'/works?filter='+encodeURIComponent('from-pub-date:'+from+',type:journal-article')+'&sort=published&order=desc&rows=100&select='+encodeURIComponent('DOI,title,author,published,published-online,published-print,issued,URL,type');const res=UrlFetchApp.fetch(url,{muteHttpExceptions:true,headers:{'User-Agent':'ResearchLabManager/1.0 (Crossref metadata reader)'}});if(res.getResponseCode()!==200)throw Error('Crossref HTTP '+res.getResponseCode());const items=JSON.parse(res.getContentText()).message.items||[];records=items.map(x=>({doi:String(x.DOI||''),title:String((x.title||[])[0]||''),date:latestDate_(x),authors:(x.author||[]).slice(0,8).map(a=>[a.given,a.family].filter(Boolean).join(' ')).join(', '),url:'https://doi.org/'+encodeURIComponent(String(x.DOI||''))})).filter(x=>x.doi&&x.title&&x.date>=from);const packed=JSON.stringify(records);if(packed.length<95000)cache.put(key,packed,21600)}catch(e){errors.push(j.name+': '+e.message);records=[]}}out.push({name:j.name,issn:j.issn,articles:records})}return {journals:out,errors,days,updatedAt:new Date().toISOString(),note:'Crossref metadata; publication dates may be incomplete or delayed. Max 100 recent records per journal.'}}

/** Delete a record only if no other record refers to it. Uploaded Drive files are never deleted. */
function apiDeleteRecord(table,id){
 const u=user_();if(u.role!=='admin')throw Error('管理者のみ操作できます / Admin only');
 const allowed=['Destinations','Members','Assignments','Meetings','Tasks','ClassSchedules','CourseCatalog','Seminars','SeminarPresentations','Outputs','Deliverables','Thesis','LabDocuments'];
 if(!allowed.includes(table))throw Error('この種類の削除には対応していません / Deletion is not supported for this record type');
 const records=rows_(table),i=records.findIndex(x=>x.id===id);
 if(i<0)throw Error('登録が見つかりません / Record not found');
 const dependencies={Destinations:[['Assignments','destinationId']],Members:[['Assignments','memberId'],['Thesis','memberId'],['Presence','memberId'],['Tasks','assigneeId']],Assignments:[['Submissions','assignmentId']],Meetings:[['Tasks','meetingId']],CourseCatalog:[['ClassSchedules','title']],Seminars:[['SeminarPresentations','seminarId'],['SeminarFiles','seminarId'],['SeminarComments','seminarId']],Outputs:[['Deliverables','outputId']],Thesis:[['Thesis','parentId']]};
 for(const [other,key] of (dependencies[table]||[])){
  if(!CFG.TABLES[other])continue;
  const used=rows_(other).some(r=>String(r[key])===String(table==='CourseCatalog'?records[i].title:id));
  if(used)throw Error('関連データがあるため削除できません / Delete related records first ('+other+')');
 }
 sheet_(table).deleteRow(i+2);return {deleted:true,id};
}

function migrateV43(){const sh=sheet_('Members');const cols=sh.getRange(1,1,1,sh.getLastColumn()).getDisplayValues()[0];['nameJa','nameEn'].filter(c=>!cols.includes(c)).forEach(c=>sh.getRange(1,sh.getLastColumn()+1).setValue(c));return 'Member bilingual names ready';}
