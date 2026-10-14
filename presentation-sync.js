// Presentation Mode — HP auto-sync v2
// -----------------------------------------------------------------------------
// SINGLE SOURCE OF TRUTH = the normal HP sections.
// Do not maintain duplicate presentation text manually.
// On load and every time PRESENT is opened, the presentation reads the current
// HP headings, body text, cards, schedule, and computed background images.
// The MutationObserver also re-syncs when Excel/data-loader updates source DOM.
// -----------------------------------------------------------------------------
(() => {
  const $=(sel,root=document)=>root.querySelector(sel);
  const $$=(sel,root=document)=>[...root.querySelectorAll(sel)];
  const txt=el=>(el?.textContent||'').replace(/\s+/g,' ').trim();
  const setText=(el,value)=>{ if(el && value!=null && value!=='') el.textContent=value; };
  const setList=(ul,values)=>{
    if(!ul) return;
    ul.innerHTML='';
    values.filter(Boolean).forEach(v=>{
      const li=document.createElement('li'); li.textContent=v; ul.appendChild(li);
    });
  };
  const computedBg=el=>{
    if(!el) return '';
    const style=getComputedStyle(el);
    return style.backgroundImage && style.backgroundImage!=='none' ? style.backgroundImage : '';
  };
  const copyBg=(src,dst)=>{
    if(!src||!dst) return;
    const image=computedBg(src);
    if(image){ dst.style.backgroundImage=image; dst.style.removeProperty('--bg'); }
  };
  const sentenceParts=value=>{
    const s=(value||'').trim(); if(!s) return [];
    let parts=s.split(/[。.!?]\s*/).map(x=>x.trim()).filter(Boolean);
    if(parts.length<3) parts=s.split(/[、,;]/).map(x=>x.trim()).filter(Boolean);
    return parts;
  };
  const slide=n=>$(`.presentation-slide[data-slide="${n}"]`);
  const recentSlide=()=>$('.presentation-slide[data-slide="recent"]');
  const firstSentence=value=>{
    const parts=sentenceParts(value||'');
    return parts[0] ? `${parts[0]}。` : (value||'').trim();
  };
  const setBrief=(dst,value)=>{
    if(!dst) return;
    let el=$('.presentation-brief',dst);
    if(!el){
      el=document.createElement('p'); el.className='presentation-brief';
      const h2=$('h2',dst); if(h2)h2.insertAdjacentElement('afterend',el); else dst.prepend(el);
    }
    el.textContent=(value||'').trim();
  };

  function syncHero(){
    const src=$('.hero'), dst=slide(1); if(!src||!dst) return;
    setText($('.eyebrow',dst),txt($('.hero .eyebrow')));
    setText($('h2',dst),txt($('.hero h1')));
    setText($('h3',dst),txt($('.brand small')) || (document.documentElement.lang==='en'?'Hayashi Research Group':'林研究グループ'));
    setText($('.presentation-lead',dst),txt($('.hero .jp'))||txt($('.hero .tagline')));
    copyBg($('.hero-bg'),dst);
    const framework=$$('#research-framework .framework-card').slice(0,3).map(c=>`${txt($('h3',c))}：${txt($('p',c))}`);
    const mindset=txt($('#lab-culture .section-head>p'));
    setList($('.presentation-talk-points',dst),[...framework,mindset].filter(Boolean).slice(0,4));
  }

  function syncFramework(){
    const src=$('#research-framework'), dst=slide(2); if(!src||!dst) return;
    setText($('h2',dst),txt($('.framework-title',src)));
    setBrief(dst,txt($('.framework-lead',src)));
    const sc=$$('.framework-card',src), dc=$$('.presentation-visual-three article',dst);
    sc.forEach((c,i)=>{ const t=dc[i]; if(!t)return; setText($('span',t),txt($('b',c))); setText($('h3',t),txt($('h3',c))); setText($('p',t),txt($('p',c))); copyBg(c,t); });
    setList($('.presentation-talk-points',dst),sc.map(c=>`${txt($('h3',c))}：${txt($('p',c))}`));
  }

  function syncResearch(){
    const src=$$('#research .cards .card'), dst=slide(3); if(!src.length||!dst) return;
    setText($('h2',dst),txt($('#research .section-head h2')));
    setBrief(dst,txt($('#research .section-head>p')));
    const dc=$$('.presentation-photo-grid article',dst);
    src.slice(0,dc.length).forEach((c,i)=>{ const t=dc[i]; setText($('h3',t),txt($('h3',c))); setText($('p',t),txt($('p',c))); copyBg(c,t); });
    setList($('.presentation-talk-points',dst),src.slice(0,4).map(c=>`${txt($('h3',c))}：${txt($('p',c))}`));
  }

  function syncApproach(){
    const src=$('#approach'), dst=slide(4); if(!src||!dst) return;
    setText($('h2',dst),txt($('.approach-copy h2',src)));
    setBrief(dst,firstSentence(txt($('.approach-copy p:not(.eyebrow)',src))));
    const parts=sentenceParts(txt($('.approach-copy p:not(.eyebrow)',src)));
    setList($('.presentation-talk-points',dst),parts.slice(0,4));
  }

  function syncResearchStyle(){
    const src=$('#research-style'), dst=slide(5); if(!src||!dst) return;
    setText($('h2',dst),txt($('.research-style-head h3',src)));
    setBrief(dst,txt($('.research-style-head>p',src)));
    const cards=$$('.research-style-grid article',src), donut=$('.balance-donut>span',dst);
    if(cards[0]&&donut){ const n=txt($('b',cards[0])).replace('%','').trim(); donut.innerHTML=`${n}<small>%</small>`; }
    const copy=$('.balance-copy',dst); if(copy){ copy.innerHTML=''; cards.forEach(card=>{ const h=document.createElement('h3'); h.textContent=`${txt($('h4',card))}：${txt($('b',card))}`; const ul=document.createElement('ul'); const li=document.createElement('li'); li.textContent=txt($('p',card)); ul.appendChild(li); copy.append(h,ul); }); }
    setList($('.presentation-talk-points',dst),cards.map(card=>`${txt($('h4',card))}：${firstSentence(txt($('p',card)))}`));
  }

  function syncExperiences(){
    const src=$$('#experience-highlights .experience-card'), dst=slide(6); if(!src.length||!dst) return;
    setBrief(dst,txt($('#activities .section-head>p')));
    const dc=$$('.presentation-photo-grid article',dst);
    src.slice(0,dc.length).forEach((c,i)=>{ const t=dc[i]; setText($('h3',t),txt($('h3',c))); setText($('p',t),txt($('p',c))); copyBg($('.experience-photo',c),t); });
    setList($('.presentation-talk-points',dst),src.slice(0,4).map(c=>txt($('p',c))));
  }

  function syncRecentActivities(){
    const dst=recentSlide(); if(!dst) return;
    const cards=$$('#activity-years .activity-card').slice(0,3);
    const targets=$$('.presentation-recent-card',dst);
    targets.forEach((target,i)=>{
      const card=cards[i];
      if(!card){ target.style.display='none'; return; }
      target.style.display='grid';
      const photo=$('.activity-image',card), meta=$('.activity-meta',card);
      copyBg(photo,$('.recent-activity-photo',target));
      const date=txt($('time',meta)), category=txt($('.tag',meta));
      setText($('.recent-activity-meta',target),[date,category].filter(Boolean).join(' / '));
      setText($('h3',target),txt($('.activity-copy h3',card)));
      setText($('.recent-activity-summary',target),firstSentence(txt($('.activity-copy p',card))));
    });
    setBrief(dst,document.documentElement.lang==='en'
      ? 'Recent field visits, conference presentations, international exchange, and other experiences that broaden learning beyond the laboratory.'
      : '現場見学・学会発表・国際交流など、研究室での学びを広げる最近の活動を紹介します。');
  }

  function syncSkills(){
    const src=$('#skills-overview'), dst=slide(7); if(!src||!dst) return;
    setText($('h2',dst),txt($('.skills-overview-head h3',src)));
    setBrief(dst,document.documentElement.lang==='en'?'Research is used to develop transferable thinking, communication, execution, and collaboration skills.':'研究を通じて、考える・伝える・実行する・協働する力を段階的に身につけます。');
    const sc=$$('.skills-overview-grid article',src), dc=$$('.presentation-skill-grid article',dst);
    sc.forEach((c,i)=>{ const t=dc[i]; if(!t)return; setText($('b',t),txt($('b',c))); setText($('h3',t),txt($('h4',c))); setText($('p',t),txt($('p',c))); });
    setList($('.presentation-talk-points',dst),sc.map(c=>txt($('p',c))));
  }

  function syncMindset(){
    const dst=slide(8); if(!dst) return;
    setText($('h3',dst),txt($('.prospective-core-message h3'))||txt($('#prospective .prospective-clean-head>p:last-child')));
    setBrief(dst,txt($('#prospective .prospective-clean-head>p:last-child')));
    const src=$$('#lab-culture .culture-principles article');
    setList($('.presentation-bullets',dst),src.map(a=>`${txt($('h3',a))} — ${firstSentence(txt($('p',a)))}`).filter(Boolean));
  }

  function syncGrowth(){
    const dst=slide(9); if(!dst) return;
    const summary=$$('.schedule-summary b').map(txt), stages=summary.map(x=>x.split(/[：:]/)[0].trim()).filter(Boolean);
    if(stages.length) setText($('h2',dst),stages.join(' → '));
    setBrief(dst,firstSentence(txt($('#schedule .schedule-intro>p'))));
    const dc=$$('.presentation-schedule-mini article',dst), phases=$$('#schedule .schedule-phase'), grouped={};
    phases.forEach(p=>{ const k=txt($('.schedule-phase-label strong',p)); if(k)(grouped[k]??=[]).push(txt($('.schedule-phase-body h4',p))); });
    dc.forEach((card,i)=>{
      const item=summary[i]||'', parts=item.split(/[：:]/), stage=(parts.shift()||'').trim(), label=parts.join('：').trim();
      setText($('b',card),stage); setText($('h3',card),label);
      const desc=(grouped[stage]||[]).filter(Boolean).join('／'); if(desc)setText($('p',card),desc);
    });
    const doctoral=txt($('#schedule .doctoral-note'));
    setList($('.presentation-talk-points',dst),[...summary.map(x=>x.trim()), firstSentence(doctoral)].filter(Boolean).slice(0,5));
  }

  function syncCareer(){
    const dst=slide(10); if(!dst) return;
    const isEn=document.documentElement.lang==='en';
    setBrief(dst,isEn
      ? 'We consider practical training, employment, and post-doctoral careers together through continued dialogue.'
      : '実務訓練・就職・博士後のキャリアまで、本人との対話を通じて長期的な進路を一緒に考えます。');
    const bullets=isEn ? [
      'Practical training: emphasize substantial, long-term experience with future career paths in mind',
      'Short internships: clarify the purpose and discuss how they fit with research before participating',
      'Career support: use information from alumni, industry engineers, and research partners when useful',
      'Career choice: aim for a good long-term fit, not simply obtaining a job offer',
      'After the PhD: support research careers, including faculty positions at universities and colleges of technology'
    ] : [
      '実務訓練：将来の進路も見据え、長期間・実践的な経験を重視する',
      '短期インターン：目的を明確にし、研究との両立を相談して参加する',
      '就職支援：卒業生・企業技術者・研究ネットワークからの情報も活用する',
      '進路選択：内定獲得だけでなく、本人と企業双方が納得できる進路を目指す',
      '博士後：大学・高専教員を含む研究者としてのキャリアまで見据えて支援する'
    ];
    setList($('.presentation-bullets',dst),bullets);
  }

  function syncAll(){
    syncHero(); syncFramework(); syncResearch(); syncApproach(); syncResearchStyle();
    syncExperiences(); syncRecentActivities(); syncSkills(); syncMindset(); syncGrowth(); syncCareer();
  }

  let pending=false;
  const scheduleSync=()=>{ if(pending)return; pending=true; requestAnimationFrame(()=>{pending=false;syncAll();}); };
  window.syncPresentationFromHP=syncAll;
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',scheduleSync,{once:true}); else scheduleSync();
  window.addEventListener('load',scheduleSync,{once:true});

  const observer=new MutationObserver(scheduleSync);
  ['.hero','#research','#research-framework','#approach','#research-style','#experience-highlights','#activities','#activity-years','#skills-overview','#prospective','#lab-culture','#schedule','.career-grid','.international-policy'].forEach(sel=>{
    const el=$(sel); if(el)observer.observe(el,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['style','class']});
  });
})();
