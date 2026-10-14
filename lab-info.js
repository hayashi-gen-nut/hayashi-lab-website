function renderLabInfo(){
  const root=document.getElementById('lab-info-groups'); if(!root) return;
  root.innerHTML=LAB_INFO_GROUPS.map((g,gi)=>`<section class="lab-resource-group"><div class="lab-resource-head"><div><p class="resource-eyebrow">${g.en}</p><h2>${g.title}</h2></div><span>${String(gi+1).padStart(2,'0')}</span></div><div class="lab-resource-grid">${g.items.map((x,i)=>`<article class="lab-resource-card"><span class="lab-resource-no">${String(i+1).padStart(2,'0')}</span><h3>${x.title}</h3><p>${x.desc}</p>${x.file?`<a href="${x.file}" target="_blank">OPEN / DOWNLOAD →</a>`:'<span class="resource-pending">準備中</span>'}</article>`).join('')}</div></section>`).join('');
}
document.addEventListener('DOMContentLoaded',renderLabInfo);
