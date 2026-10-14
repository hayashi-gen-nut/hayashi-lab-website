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
    en:'STEEL STRUCTURES', title:'鋼構造・鋼橋', photo:'photo-steel',
    lead:'鋼橋・鋼部材の損傷メカニズムと耐荷性能を明らかにし、合理的な補修・補強方法や接合技術の提案につなげます。実構造物で生じる腐食、局部座屈、ボルト接合部のすべりや荷重分担など、複雑な構造挙動を実験と解析の両面から検討します。',
    background:'高度経済成長期に整備された多くの鋼橋では、長期供用に伴う腐食や疲労、接合部の劣化が維持管理上の重要な課題となっています。一方、損傷した部材をすべて交換することは施工性・費用・交通規制の面から必ずしも合理的ではありません。本研究室では、損傷後の鋼部材がどのように荷重を伝達し、どの段階で耐荷性能を失うのかを力学的に明らかにし、既設橋梁を安全かつ効率的に使い続けるための補修・補強技術の構築を目指します。',
    whatwedo:'実物大または縮尺供試体を用いた載荷実験によって、荷重―変位関係、ひずみ分布、局部変形、座屈、すべりなどを詳細に計測します。さらに、接触、摩擦、材料非線形、ボルト軸力などを考慮した3次元FEMを構築し、実験で観察された現象の原因を解析的に検討します。必要に応じて実橋の現場調査や損傷事例の分析も行い、「現場で生じている問題」と「力学的なメカニズム」をつなげることを重視します。',
    topics:['腐食した鋼I桁端部の耐荷性能と補修・補強','高力ボルト摩擦接合部の荷重伝達とすべり挙動','薄板・高強度鋼を用いた接合部および補強部材','既設鋼橋の損傷評価・残存耐荷性能','局部座屈・接触・てこ反力など接合部の局部挙動','補修部材への荷重分担と合理的な設計法'],
    methods:['大型載荷実験・部材実験','ひずみ・変位・荷重・ボルト軸力計測','3次元有限要素解析（Abaqus等）','接触・摩擦・材料非線形解析','実橋調査・現場見学・損傷事例分析'],
    exTitle:'腐食した鋼I桁端部の緊急補修',
    exText:'支点部付近に著しい腐食損傷を受けた鋼I桁を対象に、高力ボルトで取り付ける補修部材の荷重伝達機構と耐荷性能を検討します。損傷形状や補修部材の配置を変えた載荷実験・FEM解析を通じて、補修後にどこまで耐荷性能と剛性を回復できるか、また既設部材と補修部材がどのように荷重を分担するかを明らかにし、緊急補修から恒久補修につながる合理的な設計方法を検討します。'
  },
  composite:{
    en:'COMPOSITE STRUCTURES / FRP', title:'複合構造・FRP', photo:'photo-composite',
    lead:'軽量・高強度・高耐食性を有するFRPを、橋梁や社会基盤構造物へ安全かつ合理的に適用するための研究を行います。材料そのものの強度だけでなく、ボルト接合、摩擦、長期的な軸力低下、環境作用、鋼部材との複合化まで含めて評価します。',
    background:'FRPは鋼材と比較して軽量で耐食性に優れるため、維持管理負担の低減や施工の省力化が期待される材料です。その一方で、異方性、樹脂の粘弾性、接触面の変形、材料物性値のばらつきなど、鋼構造とは異なる特性を持ちます。特にボルト接合部では、締付け後の軸力低下や摩擦特性の変化が長期性能に影響する可能性があります。本研究室では、FRPを「材料」として評価するだけでなく、「構造部材・接合部として長期間使えるか」という視点から研究します。',
    whatwedo:'GFRP部材や接合供試体を製作し、引張・圧縮・曲げ・せん断・すべり試験などを行います。また、長期間のボルト軸力計測、温度変化や水分を考慮した環境試験を行い、時間依存挙動を定量化します。実験結果は複合材料FEMや接触解析と比較し、繊維方向、板厚、接触圧、摩擦係数などが部材・接合部の性能へ与える影響を検討します。',
    topics:['GFRP部材の曲げ・圧縮・せん断挙動','高力ボルト摩擦接合されたFRP継手','ボルト軸力のリラクセーション・クリープ','FRP接合部のすべり係数とばらつき','腐食鋼管・鋼部材に対するFRP補修・補強','海洋・干満環境を想定したFRP補修の耐久性'],
    methods:['材料試験・接合部試験','長期載荷・長期軸力計測','温度・水分・浸漬などの環境作用評価','複合材料FEM・接触解析','材料物性値の統計的評価'],
    exTitle:'GFRP高力ボルト摩擦接合部の長期性能',
    exText:'GFRP板を高力ボルトで摩擦接合した場合に、導入されたボルト軸力や接触圧が時間とともにどのように変化するかを長期間計測します。短期のすべり試験だけでは評価できないリラクセーションや環境作用の影響を整理し、残存軸力とすべり耐力の関係から、FRP接合部を長期供用するための設計・維持管理上の基礎データを構築します。'
  },
  experiment:{
    en:'EXPERIMENT & ANALYSIS', title:'実験・数値解析', photo:'photo-experiment',
    lead:'「実際に壊して確かめる」ことと、「解析でなぜそうなるかを考える」ことを往復しながら、構造物の力学挙動を理解します。研究テーマに応じて、供試体設計、計測計画、載荷、データ整理、解析モデル構築まで一連の研究プロセスに取り組みます。',
    background:'構造物の破壊や損傷は、単純な理論式だけでは説明できない局部変形、接触、摩擦、座屈、材料非線形などが相互に影響して生じます。実験は実際の挙動を直接確認できる一方、計測できる量には限界があります。数値解析は内部の応力状態まで可視化できますが、モデル化が適切でなければ実現象を説明できません。本研究室では、この二つを相互に検証しながら使うことを研究の基本としています。',
    whatwedo:'供試体寸法や載荷方法の検討から始め、ひずみゲージ、変位計、荷重計、画像計測などを用いた計測計画を立てます。実験後は荷重―変位関係だけでなく、局部変形や破壊モードまで整理します。同時にAbaqusやCOMSOLを用いたFEMを構築し、メッシュ、接触条件、材料モデル、境界条件の妥当性を検証します。解析結果は「実験に合ったか」だけでなく、「なぜその挙動が生じたのか」を説明するために用います。',
    topics:['鋼部材・FRP部材の大型載荷実験','接合部・補修部の局部挙動評価','材料非線形・接触・摩擦を考慮したFEM','座屈・破壊モードの実験解析比較','4点曲げ・3点曲げ・引張・圧縮試験','実験データに基づく解析モデルの妥当性検証'],
    methods:['油圧ジャッキ・万能試験機による載荷','ひずみゲージ・変位計・画像計測','Abaqus / COMSOLによる数値解析','MATLAB / Pythonによるデータ処理','パラメトリック解析・感度分析'],
    exTitle:'大型載荷実験と3次元FEMの比較',
    exText:'実験で得られた荷重―変位関係、局部座屈、接触・すべり、ひずみ分布などを3次元FEMで再現します。結果を一致させることだけを目的とせず、どの部材が荷重を負担し、どこから損傷や座屈が始まり、最終的にどのような破壊へ至るかを力学的に説明できる解析モデルを構築します。'
  },
  monitor:{
    en:'STRUCTURAL HEALTH MONITORING', title:'構造ヘルスモニタリング', photo:'photo-monitor',
    lead:'橋梁の振動・変形・画像・点群などの計測データから、損傷や構造状態の変化を捉える技術を研究します。センサ計測、数値モデル、画像処理、AIを組み合わせ、点検・維持管理の高度化につながる方法を検討します。',
    background:'橋梁を長期間安全に使用するためには、損傷が大きくなる前に構造状態の変化を捉えることが重要です。しかし、振動特性は損傷だけでなく、温度、境界条件、計測誤差などによっても変化します。また、目視点検や点群データには膨大な情報が含まれるため、人手だけで処理するには限界があります。そこで、計測データから構造状態を定量的に読み取るSHM技術と、AI・数値解析を組み合わせた新しい維持管理手法を研究します。',
    whatwedo:'橋梁模型や実構造物に加速度計、変位計、回転角計などを設置し、振動応答や静的変形を計測します。得られたデータから固有振動数、モード形、周波数特性などを抽出し、FEMで模擬した損傷ケースと比較します。また、PSD画像や3次元点群を深層学習モデルへ入力し、損傷検知や橋梁部材の自動認識へ展開します。環境変動と損傷による変化を分離することも重要な研究課題です。',
    topics:['橋梁振動特性を用いた損傷検知','固有振動数・モード形・回転角の変化','温度・季節変動を考慮した長期モニタリング','画像・点群・AIによる橋梁部材認識','CNNを用いた損傷状態分類','デジタルツイン・有限要素モデル更新への応用'],
    methods:['加速度・変位・回転角計測','FFT・PSD・モード解析','機械学習・深層学習','点群処理・セマンティックセグメンテーション','FEMによる損傷シミュレーション'],
    exTitle:'振動データとAIを用いた橋梁損傷検知',
    exText:'橋梁模型や実構造物から得られる振動応答を解析し、損傷前後の固有振動数、回転角、周波数特性の変化を抽出します。さらに、周波数応答を画像化してCNNへ入力する方法や、FEMで多数の損傷ケースを生成する方法を組み合わせ、損傷の有無だけでなく位置や状態まで自動的に評価することを目指します。'
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


// 過年度の掲載例です。不要なら削除し、同じ形式で実際の活動を追加してください。



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
  const map={
    'photo-field':'activity-field',
    'photo-conference':'activity-conference',
    'photo-experiment':'activity-experiment',
    'photo-collaboration':'activity-collab',
    'photo-seminar':'activity-seminar',
    'photo-event':'activity-event'
  };
  return map[d.photoClass]||'';
}
function renderActivityYears(){
  const container=document.getElementById('activity-years');
  if(!container) return;
  const entries=Object.entries(activityData).sort((a,b)=>b[1].date.localeCompare(a[1].date));
  const groups={};
  entries.forEach(([key,d])=>{
    const year=(d.date||'').slice(0,4)||'OTHER';
    (groups[year]??=[]).push([key,d]);
  });
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
  // Conference-specific fields must never appear on collaboration/visit articles.
  const isConference = /^(CONFERENCE|学会発表)$/i.test(String(d.category||'').trim());
  if(!isConference){ box.hidden=true; return; }
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
  // Official publication links for the university VOS feature.
  const previousLinks=activityDialog.querySelector('.vos-official-links');
  if(previousLinks) previousLinks.remove();
  if(key==='20260731-vos238-technology-pioneer'||key==='20260415-vos237-doctoral-feature'){
    const links=document.createElement('div');
    links.className='vos-official-links';
    links.style.cssText='display:flex;flex-wrap:wrap;gap:10px;margin:16px 0;';
    const english=document.documentElement.lang==='en';
    (key==='20260415-vos237-doctoral-feature' ?
      [['https://www.nagaokaut.ac.jp/outline/pr/assets/VOS237.pdf',english?'VOS No. 237 (PDF)':'VOS第237号（PDF）']] :
      [['https://www.nagaokaut.ac.jp/research/featured/technology-pioneer/hayashi/index.html',english?'Official university article':'大学公式記事を読む'],['https://www.nagaokaut.ac.jp/outline/pr/assets/VOS238.pdf',english?'VOS No. 238 (PDF)':'VOS第238号（PDF）']]).forEach(([url,label])=>{
      const a=document.createElement('a');a.href=url;a.target='_blank';a.rel='noopener noreferrer';a.textContent=label+' ↗';
      a.style.cssText='display:inline-block;padding:9px 14px;border:1px solid #8aa6b7;border-radius:8px;font-size:14px;color:inherit;text-decoration:none;';
      links.appendChild(a);
    });
    const body=document.getElementById('activity-modal-body');
    if(body)body.insertAdjacentElement('afterend',links);
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
// フォールバック用プロフィールです。通常の更新は data/lab_data.xlsx > FacultyProfile を編集します。
// -----------------------------------------------------------------------------
const memberData={};
const memberDialog=document.getElementById('member-dialog');
const memberClose=memberDialog?.querySelector('.member-modal-close');
const memberPortrait=document.getElementById('member-portrait');
function fillMemberList(id,items){const el=document.getElementById(id);if(el)el.innerHTML=items.map(x=>`<li>${x}</li>`).join('')}
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
// ここに論文を1件追加するだけで、年度見出し・件数・並び順を自動生成します。
// year: 掲載年。新しい年を入れると、その年度欄も自動的に作られます。
// date: 同一年内の並び替え用。分からない場合は YYYY.01.01 などでも構いません。
// url: DOI / 出版社ページ等。空欄 '' の場合はクリック不可です。
// -----------------------------------------------------------------------------
const publicationData=[];

const publicationYears=document.getElementById('publication-years');
const publicationTotal=document.getElementById('publication-total');
function escapeHtml(value=''){
  return String(value).replace(/[&<>'"]/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[ch]));
}
function highlightHayashi(authors=''){
  return escapeHtml(authors)
    .replace(/林 厳/g,'<b>林 厳</b>')
    .replace(/Gen Hayashi/g,'<b>Gen Hayashi</b>');
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
// ここにお知らせを追加するだけで、自動的に日付順に並びます。
// 初期表示は最新4件。VIEW ALL を押すと全件表示になり、件数が多い場合は
// お知らせ欄の中だけスクロールできます。
// url: '#publications' のようなサイト内リンク、または https://... を指定できます。
// url:'' の場合はクリック不可です。
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
// News / Activities / Publications / Members / Alumni / Collaboration / Faculty Profile は
// data/lab_data.xlsx を唯一のデータ源として生成します。HTML / JS に初期サンプルは保持しません。
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
    LAB_EVENT:{ja:'イベント',en:'LAB EVENT',photoClass:'photo-event',photoLabel:'LAB EVENT'},
    MEDIA:{ja:'大学広報・メディア掲載',en:'MEDIA FEATURE',photoClass:'photo-event',photoLabel:'UNIVERSITY FEATURE'}
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
      const inner=`<div><span class="level">${escapeHtml(r.level||'')}</span><b>${escapeHtml(r.degree_ja||'')}</b></div>
        <div><strong>${escapeHtml(r.name_ja||'')}</strong><small>${escapeHtml(r.name_en||'')}</small></div>
        <div class="member-origin" data-label="出身"><span>${escapeHtml(r.origin_affiliation_ja||r.origin_ja||'')}</span></div>
        <div><span>${escapeHtml(r.topic_ja||'')}</span>${profile?'<span class="member-view-detail">PROFILE ↗</span>':''}</div>`;
      return profile
        ? `<button class="members-row faculty-row faculty-detail-button" data-member="${escapeHtml(profile)}" type="button" aria-label="${escapeHtml(r.name_ja||'')}のプロフィールを見る">${inner}</button>`
        : `<div class="members-row">${inner}</div>`;
    }).join('');
    table.innerHTML=`<div class="members-row members-head"><div>POSITION</div><div>NAME</div><div>出身校 / 国</div><div>RESEARCH TOPIC</div></div>${items}`;
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
      sorted.map(r=>`<div class="members-row"><div><span class="level">${escapeHtml(r.year||'')}</span><b>${escapeHtml(r.degree_ja||'')}</b></div><div><strong>${escapeHtml(r.name_ja||'')}</strong><small>${escapeHtml(r.name_en||'')}</small></div><div>${escapeHtml(r.topic_ja||'')}</div></div>`).join('');
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
      return `<article class="collaborator-person-card"><div class="collaborator-person-top"><div><p class="collaborator-country">${escapeHtml(r.country||'')}</p><h3>${nameHtml}</h3><p class="collaborator-position">${escapeHtml(r.position||'')}</p></div><span class="collaborator-index">${String(r.order||'').padStart(2,'0')}</span></div><p class="collaborator-institution">${escapeHtml(r.institution||'')}</p><p class="collaborator-field">${escapeHtml(r.field_ja||'')}</p></article>`;
    };
    domestic.innerHTML=jp.length?jp.map(card).join(''):'<p class="collaborator-empty">登録準備中です。</p>';
    international.innerHTML=intl.length?intl.map(card).join(''):'<p class="collaborator-empty">登録準備中です。</p>';
    if(domesticCount) domesticCount.textContent=`${jp.length}名`;
    if(internationalCount) internationalCount.textContent=`${intl.length}名`;
  }

  function applyFacultyProfiles(rows){
    (rows||[]).forEach(r=>{
      const key=String(r.profile_key||'').trim(); if(!key) return;
      memberData[key]={
        nameJa:r.name_ja||'', nameEn:r.name_en||'',
        position:r.position_ja||r.position_en||'', affiliation:r.affiliation_ja||'', image:r.image||'',
        lead:r.lead_ja||'', fields:splitPipe(r.fields_ja), career:splitPipe(r.career_ja), topics:splitPipe(r.topics_ja),
        message:r.message_ja||'', email:r.email||'', researchmapUrl:r.researchmap_url||'', orcidUrl:r.orcid_url||'', scholarUrl:r.scholar_url||'', scopusUrl:r.Scopus_url||r.scopus_url||''
      };
    });
  }

  window.applyExternalLabData=function(data){
    if(data.FacultyProfile?.length) applyFacultyProfiles(data.FacultyProfile);
    if(data.News?.length){
      newsData.splice(0,newsData.length,...data.News.map(r=>({date:r.date,cat:r.category,title:r.title_ja,url:r.url||''})));
      newsExpanded=false; renderNews();
    }
    if(data.Publications?.length){
      publicationData.splice(0,publicationData.length,...data.Publications.map(r=>{
        const language=String(r.language||'').trim().toLowerCase();
        const isJapanese=language==='ja';

        // Publications シートは二重入力しない簡略形式を使用します。
        // 日本語論文: *_ja と *_en の両方を入力。
        // 英語論文: *_en のみ入力すればよく、*_ja は空欄で構いません。
        return {
          year:Number(r.year),
          date:r.date||'',
          title:isJapanese ? (r.title_ja||r.title_en||'') : (r.title_en||''),
          authors:isJapanese ? (r.authors_ja||r.authors_en||'') : (r.authors_en||''),
          journal:isJapanese ? (r.journal_ja||r.journal_en||'') : (r.journal_en||''),
          note:isJapanese ? (r.note_ja||'') : '',
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
        activityData[key]={date:r.date||'',category:meta.ja||'活動',en:meta.en||'ACTIVITY',title:r.title_ja||r.title_en||'',image:r.image||'',photoClass:meta.photoClass||'',photoLabel:meta.photoLabel||'ACTIVITY PHOTO',lead:r.lead_ja||'',summary:r.lead_ja||'',body:r.body_ja||'',members:activityMembersFromRow(r,data.Members,'ja'),tags:activityTagsFromRow(r,data.Tags,'ja'),presentationTitle:r.presentation_title_ja||r.presentation_title_en||'',conferenceName:r.conference_name_ja||r.conference_name_en||'',presenter:r.presenter_ja||r.presenter_en||'',venue:r.venue_ja||r.venue_en||''};
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
