const menu=document.querySelector('.menu');
const nav=document.querySelector('.header nav');
function setMobileMenu(open){
  if(!nav||!menu) return;
  nav.classList.toggle('mobile-open',open);
  menu.setAttribute('aria-expanded',String(open));
  menu.textContent=open?'×':'☰';
}
menu?.setAttribute('aria-expanded','false');
menu?.addEventListener('click',()=>setMobileMenu(!nav?.classList.contains('mobile-open')));
nav?.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{
  if(window.innerWidth<=1240) setMobileMenu(false);
}));
window.addEventListener('resize',()=>{if(window.innerWidth>1240)setMobileMenu(false)});

const researchData={
  steel:{
    en:'STEEL STRUCTURES', title:'Steel Structures & Bridges', photo:'photo-steel',
    lead:'We investigate deterioration mechanisms and load-carrying performance of steel bridges and members, and translate the findings into rational repair, strengthening, and connection technologies. Complex behaviour such as corrosion, local buckling, slip in bolted joints, and load sharing is studied through both experiments and numerical analysis.',
    background:'Many steel bridges built during periods of rapid infrastructure development now face corrosion, fatigue, and deterioration of connections. Replacing damaged members is not always practical because of cost, constructability, and traffic restrictions. Our aim is to understand how damaged steel members transfer load and how their capacity is lost, then use that understanding to develop safe and efficient repair and strengthening strategies for existing bridges.',
    whatwedo:'We conduct loading tests on full-scale or reduced-scale specimens and measure load–displacement response, strain distributions, local deformation, buckling, and slip. Three-dimensional finite element models are then developed with contact, friction, material nonlinearity, and bolt pretension to explain the observed behaviour. Field investigation and analysis of real damage cases are also incorporated when relevant.',
    topics:['Load-carrying performance and repair of corroded steel I-girder ends','Load transfer and slip behaviour of high-strength bolted friction joints','Connections and strengthening members using thin or high-strength steel','Damage assessment and residual capacity of existing steel bridges','Local behaviour including buckling, contact, and prying action','Load sharing between existing and repair members'],
    methods:['Large-scale loading and member tests','Strain, displacement, load, and bolt-force measurement','Three-dimensional finite element analysis using Abaqus and related tools','Contact, friction, and material nonlinear analysis','Field investigation and damage-case studies'],
    exTitle:'Emergency repair of corroded steel I-girder ends',
    exText:'We study steel I-girder ends with severe corrosion near the support and evaluate repair members installed using high-strength bolts. Loading tests and FEM are used to quantify recovery of stiffness and capacity, clarify load sharing between original and repair members, and develop rational approaches that can support both emergency and permanent repair design.'
  },
  composite:{
    en:'COMPOSITE STRUCTURES / FRP', title:'Composite Structures & FRP', photo:'photo-composite',
    lead:'We study how lightweight, high-strength, corrosion-resistant FRP can be applied safely and rationally to bridges and other infrastructure. Our work covers not only material strength but also bolted connections, friction, long-term bolt-force loss, environmental effects, and hybridisation with steel.',
    background:'FRP offers low weight and high corrosion resistance, which can reduce maintenance demands and simplify construction. At the same time, anisotropy, resin viscoelasticity, contact deformation, and variability in material properties differ substantially from steel. Long-term changes in bolt force and friction can be particularly important in bolted joints. We therefore evaluate FRP as a structural system and connection, not only as a material.',
    whatwedo:'We fabricate GFRP members and joint specimens and conduct tension, compression, bending, shear, and slip tests. Long-term bolt-force monitoring and environmental tests involving temperature and moisture are used to quantify time-dependent behaviour. Experimental results are compared with composite-material and contact FEM to assess the effects of fibre direction, thickness, contact pressure, and friction.',
    topics:['Bending, compression, and shear behaviour of GFRP members','High-strength bolted friction joints in FRP','Relaxation and creep of bolt force','Slip coefficient and variability in FRP joints','FRP repair and strengthening of corroded steel pipes and members','Durability of FRP repair under marine and tidal environments'],
    methods:['Material and connection tests','Long-term loading and bolt-force monitoring','Environmental exposure including temperature, moisture, and immersion','Composite-material FEM and contact analysis','Statistical evaluation of material properties'],
    exTitle:'Long-term performance of high-strength bolted GFRP friction joints',
    exText:'We monitor the evolution of bolt force and contact pressure in high-strength bolted GFRP friction joints over long periods. By relating residual bolt force to slip resistance, the study builds basic data for the design and maintenance of FRP joints under long-term service conditions.'
  },
  experiment:{
    en:'EXPERIMENT & ANALYSIS', title:'Experiments & Numerical Analysis', photo:'photo-experiment',
    lead:'We alternate between physically testing structures and using numerical analysis to understand why they behave as they do. Students engage with the complete research process, from specimen design and instrumentation to loading, data processing, and finite element modelling.',
    background:'Structural failure often results from interacting phenomena such as local deformation, contact, friction, buckling, and material nonlinearity. Experiments reveal real behaviour but cannot measure everything, while numerical analysis can visualise internal states but is meaningful only when the modelling assumptions are appropriate. We therefore use experiments and analysis to validate and challenge each other.',
    whatwedo:'We plan specimen geometry, loading systems, and instrumentation using strain gauges, displacement transducers, load cells, and image-based measurement. After testing, we evaluate not only global load–displacement response but also local deformation and failure modes. Abaqus and COMSOL models are developed and checked with respect to mesh, contact, material models, and boundary conditions.',
    topics:['Large-scale tests of steel and FRP members','Local behaviour of connections and repair regions','FEM with material nonlinearity, contact, and friction','Comparison of buckling and failure modes between experiments and analysis','Four-point bending, three-point bending, tension, and compression tests','Validation of numerical models using experimental data'],
    methods:['Hydraulic jack and universal testing machine loading','Strain gauges, displacement transducers, and image measurement','Numerical analysis using Abaqus and COMSOL','Data processing using MATLAB and Python','Parametric and sensitivity studies'],
    exTitle:'Comparison of large-scale loading tests and 3D FEM',
    exText:'We reproduce experimental load–displacement response, local buckling, contact and slip, and strain distributions using three-dimensional FEM. The goal is not simply to match curves, but to explain load paths, initiation of damage or buckling, and the mechanics of the final failure mode.'
  },
  monitor:{
    en:'STRUCTURAL HEALTH MONITORING', title:'Structural Health Monitoring', photo:'photo-monitor',
    lead:'We investigate technologies for detecting changes in structural condition from vibration, deformation, images, and point clouds. Sensor measurements, numerical models, image processing, and AI are combined to support more advanced bridge inspection and maintenance.',
    background:'Long-term safe use of bridges requires structural changes to be identified before damage becomes severe. However, vibration characteristics are influenced not only by damage but also by temperature, boundary conditions, and measurement uncertainty. Visual inspection and point-cloud data can also contain too much information for manual processing alone. Our work combines SHM, AI, and numerical simulation to extract meaningful structural information.',
    whatwedo:'Accelerometers, displacement sensors, and rotation measurements are used on bridge models and real structures. Natural frequencies, mode shapes, and spectral features are extracted and compared with FEM damage cases. PSD images and three-dimensional point clouds are also used as inputs to deep-learning models for damage detection and bridge-component recognition.',
    topics:['Damage detection using bridge vibration characteristics','Changes in natural frequency, mode shape, and rotation angle','Long-term monitoring considering temperature and seasonal effects','Bridge component recognition using images, point clouds, and AI','Damage-state classification using CNNs','Applications to digital twins and finite element model updating'],
    methods:['Acceleration, displacement, and rotation measurement','FFT, PSD, and modal analysis','Machine learning and deep learning','Point-cloud processing and semantic segmentation','FEM-based damage simulation'],
    exTitle:'Bridge damage detection using vibration data and AI',
    exText:'We analyse vibration responses from bridge models and structures to extract changes in natural frequency, rotation angle, and frequency characteristics before and after damage. These features can be combined with CNN-based image classification and FEM-generated damage cases to automate assessment of damage presence, location, and condition.'
  }
};
const dialog=document.getElementById('research-dialog');
const closeBtn=dialog?.querySelector('.research-close');
const photo=document.getElementById('research-photo');
const en=document.getElementById('research-en');
const title=document.getElementById('research-title');
const lead=document.getElementById('research-lead');
const background=document.getElementById('research-background');
const whatwedo=document.getElementById('research-whatwedo');
const topics=document.getElementById('research-topics');
const methods=document.getElementById('research-methods');
const exampleTitle=document.getElementById('research-example-title');
const exampleText=document.getElementById('research-example-text');
function fillList(el,items){if(el) el.innerHTML=items.map(x=>`<li>${x}</li>`).join('')}
document.querySelectorAll('.card-detail').forEach(btn=>btn.addEventListener('click',()=>{
  const d=researchData[btn.dataset.research]; if(!d||!dialog) return;
  if(photo){photo.className=`research-photo ${d.photo}`; photo.innerHTML='<span>RESEARCH PHOTO / replace with your image</span>';}
  if(en) en.textContent=d.en; if(title) title.textContent=d.title; if(lead) lead.textContent=d.lead;
  if(background) background.textContent=d.background; if(whatwedo) whatwedo.textContent=d.whatwedo;
  fillList(topics,d.topics); fillList(methods,d.methods);
  if(exampleTitle) exampleTitle.textContent=d.exTitle; if(exampleText) exampleText.textContent=d.exText;
  dialog.showModal();
}));
closeBtn?.addEventListener('click',()=>dialog.close());
dialog?.addEventListener('click',e=>{if(e.target===dialog) dialog.close();});

// -----------------------------------------------------------------------------
// ACTIVITY DETAIL DATA
// ここを編集すると「研究室の活動」の詳細画面を変更できます。

// image を空欄 '' にすると、photoClass の仮背景が表示されます。
// -----------------------------------------------------------------------------
const activityData={};


// Examples from previous years. Delete or replace them with your actual records.



// -----------------------------------------------------------------------------
// AUTOMATIC IMAGE LOADING
// Activities: images/activities/<year>/<image-stem>/<image-file>
// Detail gallery: same folder, <image-stem>_01.jpg ... _20.jpg
// jpg / jpeg / png / webp are tried automatically. An explicit Excel `image`
// value, when provided, is tried first.
// -----------------------------------------------------------------------------
const AUTO_IMAGE_EXTENSIONS=['jpg','jpeg','png','webp'];
function autoImagePaths(folder,key,suffix=''){
  return AUTO_IMAGE_EXTENSIONS.map(ext=>`${folder}/${key}${suffix}.${ext}`);
}
function tryImageCandidates(paths,onSuccess,onFailure){
  const unique=[...new Set((paths||[]).filter(Boolean))];
  let i=0;
  const next=()=>{
    if(i>=unique.length){onFailure?.();return;}
    const src=unique[i++];
    const probe=new Image();
    probe.onload=()=>onSuccess?.(src);
    probe.onerror=next;
    probe.src=src;
  };
  next();
}
function setBackgroundFromCandidates(el,paths,overlay='linear-gradient(0deg,rgba(4,14,24,.42),rgba(4,14,24,.05))'){
  if(!el) return;
  tryImageCandidates(paths,src=>{el.style.backgroundImage=`${overlay},url("${src}")`;});
}
function activityYear(d){
  const m=String(d?.date||'').match(/(20\d{2})/);
  return m?m[1]:'other';
}
function activityImageFile(d){
  return String(d?.image||'').trim();
}
function activityImageBaseName(key,d){
  const v=activityImageFile(d);
  if(!v) return key;
  const last=v.split('/').pop()||v;
  return last.replace(/\.[^.]+$/,'');
}
function activityFolder(key,d){
  return `images/activities/${activityYear(d)}/${activityImageBaseName(key,d)}`;
}
function activityMainImageCandidates(key,d){
  const v=activityImageFile(d);
  if(!v) return autoImagePaths(activityFolder(key,d),activityImageBaseName(key,d));
  if(/^(?:https?:|data:|blob:)/i.test(v) || v.includes('/')) return [v];
  const folder=activityFolder(key,d);
  if(/\.[a-z0-9]+$/i.test(v)) return [`${folder}/${v}`];
  return autoImagePaths(folder,v);
}
function hydrateActivityImages(){
  document.querySelectorAll('.activity-card[data-activity]').forEach(card=>{
    const key=card.dataset.activity;
    const d=activityData[key];
    const target=card.querySelector('.activity-image');
    if(!d||!target) return;
    setBackgroundFromCandidates(target,activityMainImageCandidates(key,d));
  });
}
function renderActivityGallery(key,d){
  const gallery=document.getElementById('activity-modal-gallery');
  if(!gallery) return;
  gallery.innerHTML='';
  gallery.hidden=true;
  const base=activityImageBaseName(key,d);
  const folder=activityFolder(key,d);
  for(let n=1;n<=20;n++){
    const suffix=`_${String(n).padStart(2,'0')}`;
    const wrap=document.createElement('button');
    wrap.type='button';
    wrap.className='activity-gallery-thumb';
    wrap.setAttribute('aria-label',`Photo ${n}`);
    const img=document.createElement('img');
    img.alt=`${d.title||'Activity'} photo ${n}`;
    wrap.appendChild(img);
    gallery.appendChild(wrap);
    const candidates=autoImagePaths(folder,base,suffix);
    tryImageCandidates(candidates,src=>{
      img.src=src;
      gallery.hidden=false;
      wrap.addEventListener('click',()=>{
        if(activityPhoto) activityPhoto.style.backgroundImage=`url("${src}")`;
      });
    },()=>wrap.remove());
  }
}

function activityCardClass(d){
  const map={'photo-field':'activity-field','photo-conference':'activity-conference','photo-experiment':'activity-experiment','photo-collaboration':'activity-collab','photo-seminar':'activity-seminar','photo-event':'activity-event'};
  return map[d.photoClass]||'';
}
function renderActivityYears(){
  const container=document.getElementById('activity-years');
  if(!container) return;
  const entries=Object.entries(activityData).sort((a,b)=>b[1].date.localeCompare(a[1].date));
  const groups={};
  entries.forEach(([key,d])=>{const year=(d.date||'').slice(0,4)||'OTHER';(groups[year]??=[]).push([key,d]);});
  const years=Object.keys(groups).sort((a,b)=>b.localeCompare(a));
  container.innerHTML=years.map((year,index)=>{
    const cards=groups[year].map(([key,d])=>{
      const cls=activityCardClass(d);
      const imageStyle='';
      return `<article class="activity-card ${cls}" data-activity="${key}">
        <div class="activity-image"${imageStyle}><span>${d.en||'ACTIVITY'}</span></div>
        <div class="activity-copy">
          <div class="activity-meta"><time>${d.date}</time><span class="tag">${d.category}</span></div>
          <h3>${d.title}</h3>
          <p>${d.summary||d.lead||''}</p>
          <button class="activity-more activity-detail-button" data-activity="${key}" type="button">VIEW DETAIL <span>↗</span></button>
        </div>
      </article>`;
    }).join('');
    return `<details class="activity-year-group" ${index===0?'open':''}>
      <summary><span class="activity-year-label">${year}</span><span class="activity-year-count">${groups[year].length} ACTIVITIES</span><span class="activity-year-arrow">＋</span></summary>
      <div class="activity-year-content"><div class="activity-grid activity-grid-latest">${cards}</div></div>
    </details>`;
  }).join('');
  hydrateActivityImages();
}
renderActivityYears();

const activityDialog=document.getElementById('activity-dialog');
const activityClose=activityDialog?.querySelector('.activity-modal-close');
const activityPhoto=document.getElementById('activity-modal-photo');
function renderActivityConferenceInfo(d){
  const box=document.getElementById('activity-conference-info');
  if(!box) return;
  const fields={
    title:d.presentationTitle||'',
    conference:d.conferenceName||'',
    presenter:d.presenter||'',
    venue:d.venue||''
  };
  const ids={title:'activity-modal-presentation-title',conference:'activity-modal-conference-name',presenter:'activity-modal-presenter',venue:'activity-modal-venue'};
  let any=false;
  Object.entries(fields).forEach(([k,v])=>{
    const row=box.querySelector(`[data-conf-row="${k}"]`);
    const out=document.getElementById(ids[k]);
    if(out) out.textContent=v;
    if(row) row.hidden=!v;
    if(v) any=true;
  });
  box.hidden=!any;
}
function openActivityDetail(key){
  const d=activityData[key]; if(!d||!activityDialog) return;
  document.getElementById('activity-modal-date').textContent=d.date;
  document.getElementById('activity-modal-category').textContent=d.category;
  document.getElementById('activity-modal-en').textContent=d.en;
  document.getElementById('activity-modal-title').textContent=d.title;
  document.getElementById('activity-modal-lead').textContent=d.lead;
  document.getElementById('activity-modal-body').textContent=d.body;
  document.getElementById('activity-modal-members').textContent=d.members;
  renderActivityConferenceInfo(d);
  document.getElementById('activity-modal-tags').innerHTML=d.tags.map(x=>`<li>${x}</li>`).join('');
  if(activityPhoto){
    activityPhoto.className=`activity-modal-photo ${d.photoClass||''}`;
    activityPhoto.style.backgroundImage='';
    activityPhoto.innerHTML=`<span>${d.photoLabel||'ACTIVITY PHOTO'}</span>`;
    setBackgroundFromCandidates(activityPhoto,activityMainImageCandidates(key,d));
  }
  renderActivityGallery(key,d);
  activityDialog.showModal();
}
document.querySelectorAll('.activity-detail-button').forEach(btn=>btn.addEventListener('click',e=>{
  e.preventDefault(); e.stopPropagation(); openActivityDetail(btn.dataset.activity);
}));
document.querySelectorAll('.activity-card[data-activity]').forEach(card=>card.addEventListener('click',e=>{
  if(e.target.closest('.activity-detail-button')) return; openActivityDetail(card.dataset.activity);
}));
activityClose?.addEventListener('click',()=>activityDialog.close());
activityDialog?.addEventListener('click',e=>{if(e.target===activityDialog) activityDialog.close();});

// -----------------------------------------------------------------------------
// FACULTY PROFILE DATA
// Fallback profile. Normal updates are loaded from data/lab_data.xlsx > FacultyProfile.
const memberData={};
const memberDialog=document.getElementById('member-dialog');
const memberClose=memberDialog?.querySelector('.member-modal-close');
const memberPortrait=document.getElementById('member-portrait');
function fillMemberList(id,items){const el=document.getElementById(id);if(el)el.innerHTML=(items||[]).map(x=>`<li>${x}</li>`).join('')}
function openMemberDetail(key){
  const d=memberData[key]; if(!d||!memberDialog) return;
  document.getElementById('member-name-ja').textContent=d.nameJa;
  document.getElementById('member-name-en').textContent=d.nameEn;
  document.getElementById('member-side-position').textContent=d.position;
  document.getElementById('member-side-affiliation').textContent=d.affiliation;
  document.getElementById('member-profile-lead').textContent=d.lead;
  document.getElementById('member-message').textContent=d.message;
  fillMemberList('member-fields',d.fields); fillMemberList('member-career',d.career); fillMemberList('member-topics',d.topics);
  const email=document.getElementById('member-email-link'); if(email){email.href=d.email?`mailto:${d.email}`:'#access';email.textContent=d.email?'Contact →':'Contact / Access →';}
  if(memberPortrait){memberPortrait.style.backgroundImage='';if(d.image){memberPortrait.style.backgroundImage=`linear-gradient(145deg,rgba(21,64,91,.08),rgba(6,21,32,.58)),url("${d.image}")`;}memberPortrait.innerHTML='<span>PROFILE PHOTO</span>';}
  const profileLinks=[['member-researchmap-link',d.researchmapUrl],['member-orcid-link',d.orcidUrl],['member-scholar-link',d.scholarUrl],['member-scopus-link',d.scopusUrl]];
  profileLinks.forEach(([id,url])=>{const a=document.getElementById(id);if(a){a.hidden=!url;if(url)a.href=url;}});
  memberDialog.showModal();
}
document.querySelectorAll('.faculty-detail-button').forEach(btn=>btn.addEventListener('click',()=>openMemberDetail(btn.dataset.member)));
memberClose?.addEventListener('click',()=>memberDialog.close());
memberDialog?.addEventListener('click',e=>{if(e.target===memberDialog)memberDialog.close();});
document.getElementById('member-publications-link')?.addEventListener('click',()=>memberDialog?.close());



// -----------------------------------------------------------------------------
// PUBLICATION DATA
// Add one paper here and the year headings, counts, and ordering are generated automatically.
// year: publication year. A new year is created automatically.
// date: used to order papers within the same year. YYYY.01.01 is fine if the exact date is unknown.
// url: DOI / publisher page. Leave as '' when no link is needed.
// -----------------------------------------------------------------------------
const publicationData=[];

const publicationYears=document.getElementById('publication-years');
const publicationTotal=document.getElementById('publication-total');
function escapeHtml(value=''){
  return String(value).replace(/[&<>'"]/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[ch]));
}
function highlightHayashi(authors=''){
  return escapeHtml(authors)
    .replace(/Gen Hayashi/g,'<b>Gen Hayashi</b>')
    .replace(/林 厳/g,'<b>林 厳</b>');
}
function renderPublications(){
  if(!publicationYears) return;
  if(publicationTotal) publicationTotal.textContent=String(publicationData.length);
  const sorted=[...publicationData].sort((a,b)=>{
    if(Number(b.year)!==Number(a.year)) return Number(b.year)-Number(a.year);
    return String(b.date||'').localeCompare(String(a.date||''));
  });
  const grouped=sorted.reduce((acc,p)=>{
    const y=String(p.year);
    (acc[y]??=[]).push(p);
    return acc;
  },{});
  publicationYears.innerHTML=Object.keys(grouped)
    .sort((a,b)=>Number(b)-Number(a))
    .map(year=>{
      const papers=grouped[year];
      const rows=papers.map(p=>{
        const isExternal=/^https?:\/\//.test(p.url||'');
        const tag=p.url?'a':'div';
        const attrs=p.url?`href="${escapeHtml(p.url)}"${isExternal?' target="_blank" rel="noopener"':''}`:'';
        return `<${tag} class="publication-row${p.url?' is-link':''}" ${attrs}>\n          <span class="publication-type">JOURNAL</span>\n          <span class="publication-info">\n            <strong>${escapeHtml(p.title)}</strong>\n            <small>${highlightHayashi(p.authors)}</small>\n            <em>${escapeHtml(p.journal)}</em>\n            ${p.note?`<span class="publication-language-note">${escapeHtml(p.note)}</span>`:''}\n          </span>\n          <span class="publication-row-arrow">${p.url?'↗':''}</span>\n        </${tag}>`;
      }).join('');
      return `<details class="publication-year">\n        <summary>\n          <span class="publication-year-label">${year}</span>\n          <span class="publication-count">${papers.length} ${papers.length===1?'PUBLICATION':'PUBLICATIONS'}</span>\n          <span class="publication-arrow">＋</span>\n        </summary>\n        <div class="publication-list">${rows}</div>\n      </details>`;
    }).join('');
}
renderPublications();

// -----------------------------------------------------------------------------
// NEWS DATA
// Add news items here; they are automatically sorted by date.
// The latest four are shown by default. VIEW ALL expands the list and the area becomes scrollable when long.
// url may be an internal anchor such as #publications or an external https:// URL.
// -----------------------------------------------------------------------------
const newsData=[];
let newsExpanded=false;
const newsList=document.getElementById('news-list');
const newsToggle=document.getElementById('news-toggle');
function renderNews(){
  if(!newsList) return;
  const sorted=[...newsData].sort((a,b)=>b.date.localeCompare(a.date));
  const items=newsExpanded?sorted:sorted.slice(0,4);
  newsList.innerHTML=items.map(n=>{
    const external=/^https?:\/\//.test(n.url||'');
    const tag=n.url?'a':'div';
    const attrs=n.url?`href="${n.url}"${external?' target="_blank" rel="noopener"':''}`:'';
    return `<${tag} class="news-row${n.url?' is-link':''}" ${attrs}><time>${n.date}</time><span class="news-cat">${n.cat}</span><span class="news-text">${n.title}</span><span class="news-arrow">${n.url?'↗':''}</span></${tag}>`;
  }).join('');
  newsList.classList.toggle('news-expanded',newsExpanded);
  if(newsToggle){
    newsToggle.textContent=newsExpanded?'SHOW LATEST 4 ↑':'VIEW ALL →';
    newsToggle.hidden=sorted.length<=4;
  }
}
newsToggle?.addEventListener('click',()=>{newsExpanded=!newsExpanded;renderNews();});
renderNews();

// =============================================================================
// EXCEL DATA BRIDGE
// Dynamic sections are generated only from data/lab_data.xlsx. No embedded fallback records are used.
// If Excel loading fails, the embedded sample data remains visible.
// =============================================================================
(function(){
  const splitPipe=v=>String(v||'').split('|').map(x=>x.trim()).filter(Boolean);
  const orderRows=rows=>[...(rows||[])].sort((a,b)=>Number(a.order||999)-Number(b.order||999));
  const activityCategoryMeta={
    FIELD_TRIP:{ja:'現場見学',en:'FIELD TRIP',photoClass:'photo-field',photoLabel:'FIELD TRIP'},
    FIELD_EXPERIMENT:{ja:'現場実験',en:'FIELD EXPERIMENT',photoClass:'photo-field',photoLabel:'FIELD EXPERIMENT'},
    LAB_EXPERIMENT:{ja:'室内実験',en:'LAB EXPERIMENT',photoClass:'photo-experiment',photoLabel:'LAB EXPERIMENT'},
    CONFERENCE:{ja:'学会発表',en:'CONFERENCE',photoClass:'photo-conference',photoLabel:'CONFERENCE / PRESENTATION'},
    COLLABORATION:{ja:'共同研究',en:'COLLABORATION',photoClass:'photo-collaboration',photoLabel:'INTERNATIONAL COLLABORATION'},
    LAB_SEMINAR:{ja:'研究発表',en:'LAB SEMINAR',photoClass:'photo-seminar',photoLabel:'LAB SEMINAR'},
    LAB_EVENT:{ja:'イベント',en:'LAB EVENT',photoClass:'photo-event',photoLabel:'LAB EVENT'}
  };
  const activitySelections=(r,prefix,count=6)=>Array.from({length:count},(_,i)=>String(r[`${prefix}_${i+1}`]||'').trim()).filter(Boolean);
  function activityMembersFromRow(r,memberRows,lang){
    const selected=activitySelections(r,'member');
    if(!selected.length) return lang==='en'?(r.members_en||''):(r.members_ja||'');
    const lookup=new Map((memberRows||[]).map(m=>[String(m.name_ja||'').trim(),m]));
    const names=selected.map(name=>{const m=lookup.get(name);return lang==='en'?(m?.name_en||name):name;});
    const note=String(lang==='en'?(r.members_note_en||''):(r.members_note_ja||'')).trim();
    const text=(lang==='en'?'Participants: ':'参加：')+names.join(lang==='en'?', ':'、');
    return note?`${text}\n${note}`:text;
  }
  function activityTagsFromRow(r,tagRows,lang){
    const selected=activitySelections(r,'tag');
    if(!selected.length) return splitPipe(lang==='en'?r.tags_en:r.tags_ja);
    if(lang!=='en') return selected;
    const lookup=new Map((tagRows||[]).map(t=>[String(t.tag_ja||'').trim(),String(t.tag_en||t.tag_ja||'').trim()]));
    return selected.map(tag=>lookup.get(tag)||tag);
  }
  function validActivityRows(rows){
    return (rows||[]).filter(r=>r && [r.date,r.title_ja,r.title_en,r.image,r.category_key].some(v=>String(v||'').trim()!==''));
  }

  function renderMembersFromRows(rows){
    const table=document.querySelector('#members > .members-table');
    if(!table||!rows?.length) return;
    const items=orderRows(rows).map(r=>{
      const profile=String(r.profile_key||'').trim();
      const inner=`<div><span class="level">${escapeHtml(r.level||'')}</span><b>${escapeHtml(r.degree_en||'')}</b></div>
        <div><strong>${escapeHtml(r.name_en||'')}</strong><small>${escapeHtml(r.name_ja||'')}</small></div>
        <div class="member-origin" data-label="ORIGIN"><span>${escapeHtml(r.origin_affiliation_en||r.origin_en||'')}</span></div>
        <div><span>${escapeHtml(r.topic_en||'')}</span>${profile?'<span class="member-view-detail">PROFILE ↗</span>':''}</div>`;
      return profile
        ? `<button class="members-row faculty-row faculty-detail-button" data-member="${escapeHtml(profile)}" type="button" aria-label="View ${escapeHtml(r.name_en||'')} profile">${inner}</button>`
        : `<div class="members-row">${inner}</div>`;
    }).join('');
    table.innerHTML=`<div class="members-row members-head"><div>POSITION</div><div>NAME</div><div>SCHOOL / COUNTRY</div><div>RESEARCH TOPIC</div></div>${items}`;
    if(!table.dataset.excelDelegated){
      table.addEventListener('click',e=>{
        const btn=e.target.closest('.faculty-detail-button');
        if(btn) openMemberDetail(btn.dataset.member);
      });
      table.dataset.excelDelegated='1';
    }
  }

  function renderAlumniFromRows(rows){
    const table=document.querySelector('.alumni-table');
    if(!table||!rows?.length) return;
    const sorted=[...rows].sort((a,b)=>Number(b.year||0)-Number(a.year||0));
    table.innerHTML=`<div class="members-row members-head"><div>YEAR / DEGREE</div><div>NAME</div><div>RESEARCH TOPIC</div></div>`+
      sorted.map(r=>`<div class="members-row"><div><span class="level">${escapeHtml(r.year||'')}</span><b>${escapeHtml(r.degree_en||'')}</b></div><div><strong>${escapeHtml(r.name_en||'')}</strong><small>${escapeHtml(r.name_ja||'')}</small></div><div>${escapeHtml(r.topic_en||'')}</div></div>`).join('');
  }

  function renderCollaborators(rows){
    const domestic=document.getElementById('collaborators-domestic');
    const international=document.getElementById('collaborators-international');
    const domesticCount=document.getElementById('collaborators-domestic-count');
    const internationalCount=document.getElementById('collaborators-international-count');
    if(!domestic||!international) return;
    const ordered=orderRows(rows).filter(r=>r && (r.name||r.institution));
    const jp=ordered.filter(r=>String(r.country||'').trim().toLowerCase()==='japan');
    const intl=ordered.filter(r=>String(r.country||'').trim().toLowerCase()!=='japan');
    const card=r=>{
      const url=(r.source_url||'').trim();
      const name=escapeHtml(r.name||'');
      const nameHtml=url?`<a href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer">${name}<span aria-hidden="true"> ↗</span></a>`:`<strong>${name}</strong>`;
      return `<article class="collaborator-person-card"><div class="collaborator-person-top"><div><p class="collaborator-country">${escapeHtml(r.country||'')}</p><h3>${nameHtml}</h3><p class="collaborator-position">${escapeHtml(r.position||'')}</p></div><span class="collaborator-index">${String(r.order||'').padStart(2,'0')}</span></div><p class="collaborator-institution">${escapeHtml(r.institution||'')}</p><p class="collaborator-field">${escapeHtml(r.field_en||'')}</p></article>`;
    };
    domestic.innerHTML=jp.length?jp.map(card).join(''):'<p class="collaborator-empty">No entries yet.</p>';
    international.innerHTML=intl.length?intl.map(card).join(''):'<p class="collaborator-empty">No entries yet.</p>';
    if(domesticCount) domesticCount.textContent=`${jp.length}`;
    if(internationalCount) internationalCount.textContent=`${intl.length}`;
  }

  function applyFacultyProfiles(rows){
    (rows||[]).forEach(r=>{
      const key=String(r.profile_key||'').trim(); if(!key) return;
      memberData[key]={
        nameJa:r.name_en||'', nameEn:r.name_ja||'',
        position:r.position_en||r.position_ja||'', affiliation:r.affiliation_en||'', image:r.image||'',
        lead:r.lead_en||'', fields:splitPipe(r.fields_en), career:splitPipe(r.career_en), topics:splitPipe(r.topics_en),
        message:r.message_en||'', email:r.email||'', researchmapUrl:r.researchmap_url||'', orcidUrl:r.orcid_url||'', scholarUrl:r.scholar_url||'', scopusUrl:r.Scopus_url||r.scopus_url||''
      };
    });
  }

  window.applyExternalLabData=function(data){
    if(data.FacultyProfile?.length) applyFacultyProfiles(data.FacultyProfile);
    if(data.News?.length){
      newsData.splice(0,newsData.length,...data.News.map(r=>({date:r.date,cat:r.category,title:r.title_en,url:r.url||''})));
      newsExpanded=false; renderNews();
    }
    if(data.Publications?.length){
      publicationData.splice(0,publicationData.length,...data.Publications.map(r=>{
        const language=String(r.language||'').trim().toLowerCase();
        const isJapanese=language==='ja';
        let note=String(r.note_en||'').trim();

        // The English site always reads the *_en fields.
        // For Japanese-language papers, "In Japanese" is guaranteed even if note_en is blank.
        if(isJapanese && !/\bin japanese\b/i.test(note)){
          note=note ? `${note}; In Japanese` : 'In Japanese';
        }

        return {
          year:Number(r.year),
          date:r.date||'',
          title:r.title_en||'',
          authors:r.authors_en||'',
          journal:r.journal_en||'',
          note,
          language,
          url:r.url||''
        };
      }));
      renderPublications();
    }
    if(data.Activities?.length){
      Object.keys(activityData).forEach(k=>delete activityData[k]);
      validActivityRows(data.Activities).forEach((r,i)=>{
        const meta=activityCategoryMeta[String(r.category_key||'').trim()]||{};
        const autoKey=`${String(r.date||'').replace(/\D/g,'')||'activity'}-${String(r.category_key||'activity').toLowerCase().replace(/[^a-z0-9]+/g,'-')}-${String(i+1).padStart(2,'0')}`;
        const key=String(r.id||'').trim()||autoKey;
        activityData[key]={date:r.date||'',category:meta.en||'ACTIVITY',en:meta.en||'ACTIVITY',title:r.title_en||r.title_ja||'',image:r.image||'',photoClass:meta.photoClass||'',photoLabel:meta.photoLabel||'ACTIVITY PHOTO',lead:r.lead_en||'',summary:r.lead_en||'',body:r.body_en||'',members:activityMembersFromRow(r,data.Members,'en'),tags:activityTagsFromRow(r,data.Tags,'en'),presentationTitle:r.presentation_title_en||r.presentation_title_ja||'',conferenceName:r.conference_name_en||r.conference_name_ja||'',presenter:r.presenter_en||r.presenter_ja||'',venue:r.venue_en||r.venue_ja||''};
      });
      renderActivityYears();
      const container=document.getElementById('activity-years');
      if(container&&!container.dataset.excelDelegated){
        container.addEventListener('click',e=>{
          const item=e.target.closest('[data-activity]');
          if(item){e.preventDefault();e.stopPropagation();openActivityDetail(item.dataset.activity);}
        });
        container.dataset.excelDelegated='1';
      }
    }
    if(data.Members?.length) renderMembersFromRows(data.Members);
    if(data.Alumni?.length) renderAlumniFromRows(data.Alumni);
    if(data.Collaborators?.length) renderCollaborators(data.Collaborators);
  };
})();

// v16 — Presentation Mode
(()=>{
  const shell=document.getElementById('presentation-shell');
  if(!shell) return;
  const slides=[...shell.querySelectorAll('.presentation-slide')];
  const counter=document.getElementById('presentation-counter');
  const prev=document.getElementById('presentation-prev');
  const next=document.getElementById('presentation-next');
  const close=document.getElementById('presentation-close');
  let idx=0;
  const show=(n)=>{idx=(n+slides.length)%slides.length;slides.forEach((s,i)=>s.classList.toggle('active',i===idx));if(counter)counter.textContent=`${idx+1} / ${slides.length}`;};
  const open=()=>{window.syncPresentationFromHP?.();shell.classList.add('open');shell.setAttribute('aria-hidden','false');document.body.classList.add('presentation-active');show(0);document.documentElement.requestFullscreen?.().catch(()=>{});};
  const shut=()=>{shell.classList.remove('open');shell.setAttribute('aria-hidden','true');document.body.classList.remove('presentation-active');if(document.fullscreenElement)document.exitFullscreen?.().catch(()=>{});};
  document.querySelectorAll('.presentation-launch').forEach(b=>b.addEventListener('click',open));
  prev?.addEventListener('click',()=>show(idx-1));next?.addEventListener('click',()=>show(idx+1));close?.addEventListener('click',shut);
  document.addEventListener('keydown',(e)=>{if(!shell.classList.contains('open'))return;if(e.key==='ArrowRight'||e.key==='PageDown'){e.preventDefault();show(idx+1)}else if(e.key==='ArrowLeft'||e.key==='PageUp'){e.preventDefault();show(idx-1)}else if(e.key==='Escape'){shut()}});
})();
