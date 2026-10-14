/*
  Lightweight client-side access gate for static pages.
  This is meant as a simple deterrent only. For real access control, use
  server-side Basic Auth/.htpasswd or your university/NAS authentication.

  Temporary passwords:
    Lectures: NUTlecture2026
    Lab Info: NUTlab2026
*/
const RESOURCE_ACCESS = {
  lectures: {
    label: '講義資料',
    password: 'NUTlecture2026',
    storageKey: 'nut-steel-lab-lectures-access'
  },
  lab: {
    label: '研究室内Info',
    password: 'NUTlab2026',
    storageKey: 'nut-steel-lab-info-access'
  }
};

function initResourceGate(kind){
  const cfg=RESOURCE_ACCESS[kind];
  if(!cfg) return;
  const gate=document.getElementById('resource-gate');
  const app=document.getElementById('resource-app');
  const form=document.getElementById('resource-gate-form');
  const input=document.getElementById('resource-password');
  const error=document.getElementById('resource-gate-error');
  const title=document.getElementById('resource-gate-title');
  if(title) title.textContent=cfg.label;
  const unlock=()=>{
    if(gate) gate.hidden=true;
    if(app) app.hidden=false;
    document.body.classList.remove('resource-locked');
    window.dispatchEvent(new CustomEvent('resource:unlocked',{detail:{kind}}));
  };
  if(sessionStorage.getItem(cfg.storageKey)==='ok') { unlock(); return; }
  document.body.classList.add('resource-locked');
  if(gate) gate.hidden=false;
  if(app) app.hidden=true;
  form?.addEventListener('submit',e=>{
    e.preventDefault();
    if((input?.value||'')===cfg.password){
      sessionStorage.setItem(cfg.storageKey,'ok');
      if(error) error.textContent='';
      unlock();
    }else{
      if(error) error.textContent='パスワードが違います。';
      input?.select();
    }
  });
}

document.addEventListener('DOMContentLoaded',()=>{
  const menu=document.querySelector('.resource-page .menu');
  const nav=document.querySelector('.resource-page nav.nav-two-row');
  menu?.addEventListener('click',()=>nav?.classList.toggle('mobile-open'));
  nav?.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>nav.classList.remove('mobile-open')));
});
