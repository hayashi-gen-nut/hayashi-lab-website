// Shared Approach carousel for normal HP + Presentation Mode
// Single source of truth for images used in both places.
(() => {
  const lang=(document.documentElement.lang||'ja').toLowerCase();
  const isEn=lang.startsWith('en');
  const slides=[
    {
      key:'experiment',
      image:'images/featured/approach_experiment.jpg',
      label:isEn?'EXPERIMENT':'実験 / EXPERIMENT',
      alt:isEn?'Laboratory loading experiment':'室内載荷実験'
    },
    {
      key:'analysis',
      image:'images/featured/approach_analysis_v34.png',
      label:isEn?'ANALYSIS':'解析 / ANALYSIS',
      alt:isEn?'Finite element analysis and experimental validation':'FEM解析と実験検証'
    },
    {
      key:'field',
      image:'images/featured/approach_field_v34.png',
      label:isEn?'FIELD':'現場 / FIELD',
      alt:isEn?'Bridge field activity with research team':'橋梁現場での研究・見学活動'
    }
  ];
  window.APPROACH_SLIDES=slides;

  function init(root){
    const track=root.querySelector('.approach-carousel-track');
    const label=root.querySelector('.approach-carousel-label');
    const dots=root.querySelector('.approach-carousel-dots');
    if(!track||!label||!dots) return;
    track.innerHTML=''; dots.innerHTML='';
    let index=0, timer=null;
    const items=slides.map((s,i)=>{
      const figure=document.createElement('figure');
      figure.className='approach-carousel-slide';
      figure.dataset.key=s.key;
      const img=document.createElement('img');
      img.src=s.image; img.alt=s.alt; img.loading=i===0?'eager':'lazy';
      figure.appendChild(img); track.appendChild(figure);
      const b=document.createElement('button'); b.type='button'; b.className='approach-carousel-dot'; b.setAttribute('aria-label',`${i+1}`);
      b.addEventListener('click',()=>{show(i); restart();}); dots.appendChild(b);
      return figure;
    });
    const dotItems=[...dots.children];
    const show=(n)=>{
      index=(n+items.length)%items.length;
      items.forEach((el,i)=>el.classList.toggle('active',i===index));
      dotItems.forEach((el,i)=>el.classList.toggle('active',i===index));
      label.textContent=slides[index].label;
    };
    const intervalMs=root.classList.contains('presentation-approach-carousel') ? 10000 : 8000;
    const start=()=>{ timer=setInterval(()=>show(index+1),intervalMs); };
    const stop=()=>{ if(timer){clearInterval(timer);timer=null;} };
    const restart=()=>{stop();start();};
    root.addEventListener('mouseenter',stop); root.addEventListener('mouseleave',start);
    root.addEventListener('focusin',stop); root.addEventListener('focusout',start);
    show(0); start();
  }
  const boot=()=>document.querySelectorAll('.js-approach-carousel').forEach(init);
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot,{once:true}); else boot();
})();
