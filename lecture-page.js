let lecturePresentationSlides=[];
let lecturePresentationIndex=0;

function escapeHtml(v=''){return String(v).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));}
function lectureBrief(v=''){const s=String(v||'').trim(); const p=s.split(/[。.!?]/).map(x=>x.trim()).filter(Boolean); return p[0] ? `${p[0]}。` : s;}
function sessionHref(courseId,no){return `lecture.html?course=${encodeURIComponent(courseId)}&session=${no}`;}

function renderCourseLibrary(){
  const target=document.getElementById('course-library');
  if(!target) return;
  target.innerHTML=LECTURE_CATALOG.map(c=>`<a class="course-card" href="lecture.html?course=${c.id}">
    <div class="course-card-top"><span>${escapeHtml(c.level)} / ${escapeHtml(c.term)}</span><b>${c.accent}</b></div>
    <h2>${escapeHtml(c.title)}</h2><p class="course-en">${escapeHtml(c.en)}</p>
    <p>${escapeHtml(c.description)}</p>
    <div class="course-card-foot"><span>全15回</span><strong>OPEN →</strong></div>
  </a>`).join('');
}

function renderCoursePage(){
  const root=document.getElementById('lecture-course-root');
  if(!root) return;
  const params=new URLSearchParams(location.search);
  const courseId=params.get('course')||LECTURE_CATALOG[0].id;
  const course=getLectureCourse(courseId);
  const sessions=getLectureSessions(courseId);
  document.title=`${course.title} | Steel Structure Lab.`;
  document.getElementById('lecture-course-level').textContent=`${course.level} / ${course.term}`;
  document.getElementById('lecture-course-title').textContent=course.title;
  document.getElementById('lecture-course-en').textContent=course.en;
  document.getElementById('lecture-course-description').textContent=course.description;
  const list=document.getElementById('lecture-session-list');
  list.innerHTML=sessions.map(s=>`<article class="lecture-session-card" id="session-${s.no}">
    <div class="session-number"><span>SESSION</span><strong>${String(s.no).padStart(2,'0')}</strong></div>
    <div class="session-main">
      <p class="session-kicker">第${s.no}回</p><h3>${escapeHtml(s.shortTitle||s.title)}</h3>
      <p class="session-summary">${escapeHtml(s.summary)}</p>
      <div class="session-keywords">${(s.keywords||[]).map(k=>`<span>${escapeHtml(k)}</span>`).join('')}</div>
    </div>
    <div class="session-actions">
      <a href="${sessionHref(courseId,s.no)}">DETAIL</a>
      <button type="button" class="session-present" data-session="${s.no}">PRESENT</button>
    </div>
  </article>`).join('');
  list.querySelectorAll('.session-present').forEach(b=>b.addEventListener('click',()=>openLecturePresentation(course,sessions.find(s=>s.no===+b.dataset.session))));
  const requested=Number(params.get('session'));
  if(requested){renderSessionDetail(course,sessions.find(s=>s.no===requested)||sessions[0]);}
}

function renderSessionDetail(course,s){
  const wrap=document.getElementById('lecture-detail');
  if(!wrap||!s) return;
  wrap.hidden=false;
  wrap.innerHTML=`<div class="lecture-detail-head">
      <div><p class="resource-eyebrow">${escapeHtml(course.level)} / ${escapeHtml(course.title)} / SESSION ${String(s.no).padStart(2,'0')}</p>
      <h2>第${s.no}回　${escapeHtml(s.shortTitle||s.title)}</h2></div>
      <button type="button" class="resource-present-primary" id="detail-present">PRESENT MODE</button>
    </div>
    <p class="lecture-detail-lead">${escapeHtml(s.summary)}</p>
    <div class="lecture-detail-grid">
      <section><p class="resource-eyebrow">LEARNING GOALS</p><h3>この回の到達目標</h3><ul>${(s.objectives||[]).map(x=>`<li>${escapeHtml(x)}</li>`).join('')}</ul></section>
      <section><p class="resource-eyebrow">KEYWORDS</p><h3>キーワード</h3><div class="detail-keywords">${(s.keywords||[]).map(x=>`<span>${escapeHtml(x)}</span>`).join('')}</div></section>
    </div>
    <section class="lecture-reading"><p class="resource-eyebrow">DETAIL</p><h3>詳細説明</h3><p>${escapeHtml(s.detail)}</p></section>
    <div class="lecture-material-grid">
      <section><p class="resource-eyebrow">HANDOUT</p><h3>配布資料</h3>${s.handout?`<a class="resource-file-button" href="${escapeHtml(s.handout)}" target="_blank">PDFを開く →</a>`:'<p class="resource-pending">準備中</p>'}</section>
      <section><p class="resource-eyebrow">VIDEO</p><h3>講義動画</h3>${s.video?`<a class="resource-file-button" href="${escapeHtml(s.video)}" target="_blank">動画を見る →</a>`:'<p class="resource-pending">作成中</p>'}</section>
    </div>`;
  document.getElementById('detail-present').addEventListener('click',()=>openLecturePresentation(course,s));
  setTimeout(()=>wrap.scrollIntoView({behavior:'smooth',block:'start'}),60);
}

function buildPresentationSlides(course,s){
  return [
    {type:'title',eyebrow:`${course.title} / 第${s.no}回`,title:s.shortTitle||s.title,lead:s.summary},
    {eyebrow:'TODAY',title:'今日のポイント',bullets:s.objectives},
    {eyebrow:'KEYWORDS',title:'キーワード',chips:s.keywords},
    {eyebrow:'EXPLANATION',title:'簡単な説明',lead:lectureBrief(s.detail||s.summary),bullets:(s.objectives||[]).slice(0,3)},
    {eyebrow:'REVIEW',title:'まとめ',bullets:[...(s.objectives||[]),'詳細・配布資料は通常ページで確認']}
  ];
}
function openLecturePresentation(course,s){
  lecturePresentationSlides=buildPresentationSlides(course,s);
  lecturePresentationIndex=0;
  document.getElementById('lecture-present-shell').classList.add('open');
  document.body.classList.add('presentation-active');
  renderLecturePresentation();
}
function renderLecturePresentation(){
  const slide=lecturePresentationSlides[lecturePresentationIndex];
  const body=document.getElementById('lecture-present-slide');
  const count=document.getElementById('lecture-present-counter');
  if(!slide||!body) return;
  count.textContent=`${lecturePresentationIndex+1} / ${lecturePresentationSlides.length}`;
  body.className=`lecture-present-slide ${slide.type==='title'?'title-slide':''}`;
  body.innerHTML=`<div class="lecture-present-inner"><p class="resource-eyebrow">${escapeHtml(slide.eyebrow||'')}</p><h2>${escapeHtml(slide.title||'')}</h2>${slide.lead?`<p class="lecture-present-lead">${escapeHtml(slide.lead)}</p>`:''}${slide.bullets?`<ul>${slide.bullets.map(x=>`<li>${escapeHtml(x)}</li>`).join('')}</ul>`:''}${slide.chips?`<div class="lecture-present-chips">${slide.chips.map(x=>`<span>${escapeHtml(x)}</span>`).join('')}</div>`:''}</div>`;
}
function closeLecturePresentation(){document.getElementById('lecture-present-shell')?.classList.remove('open');document.body.classList.remove('presentation-active');}
function moveLecturePresentation(delta){lecturePresentationIndex=Math.max(0,Math.min(lecturePresentationSlides.length-1,lecturePresentationIndex+delta));renderLecturePresentation();}

function initLecturePresentationControls(){
  document.getElementById('lecture-present-close')?.addEventListener('click',closeLecturePresentation);
  document.getElementById('lecture-present-prev')?.addEventListener('click',()=>moveLecturePresentation(-1));
  document.getElementById('lecture-present-next')?.addEventListener('click',()=>moveLecturePresentation(1));
  document.addEventListener('keydown',e=>{
    if(!document.getElementById('lecture-present-shell')?.classList.contains('open')) return;
    if(e.key==='Escape') closeLecturePresentation();
    if(e.key==='ArrowRight') moveLecturePresentation(1);
    if(e.key==='ArrowLeft') moveLecturePresentation(-1);
  });
}

document.addEventListener('DOMContentLoaded',()=>{
  renderCourseLibrary();
  renderCoursePage();
  initLecturePresentationControls();
});
