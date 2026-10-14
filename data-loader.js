(function(){
  const isEnglish = document.documentElement.lang === 'en' || location.pathname.endsWith('/en.html');

  function sheetRows(workbook, name){
    const ws = workbook.Sheets[name];
    if(!ws) return [];
    const rows=XLSX.utils.sheet_to_json(ws,{defval:'',raw:false});
    // Data validation and formatting may extend the worksheet range far below the
    // actual data. Remove rows whose cells are all blank so they never become
    // phantom News / Activities / Members entries.
    return rows.filter(row=>Object.values(row||{}).some(v=>String(v??'').trim()!==''));
  }

  function workbookToData(workbook){
    return {
      News: sheetRows(workbook,'News'),
      Activities: sheetRows(workbook,'Activities'),
      Publications: sheetRows(workbook,'Publications'),
      Members: sheetRows(workbook,'Members'),
      Alumni: sheetRows(workbook,'Alumni'),
      Collaborators: sheetRows(workbook,'Collaborators'),
      FacultyProfile: sheetRows(workbook,'FacultyProfile'),
      SiteSettings: sheetRows(workbook,'SiteSettings'),
      Tags: sheetRows(workbook,'Tags')
    };
  }

  function settingsObject(rows){
    const out={};
    (rows||[]).forEach(r=>{
      const key=String(r.key||'').trim();
      if(!key) return;
      out[key]=isEnglish ? (r.value_en||r.value_ja||'') : (r.value_ja||r.value_en||'');
    });
    return out;
  }

  function applySiteSettings(rows){
    const cfg=settingsObject(rows);
    const setText=(id,val)=>{const el=document.getElementById(id); if(el&&val) el.textContent=val;};
    const setHref=(id,val)=>{const el=document.getElementById(id); if(el&&val) el.href=val;};

    setText('access-lab-name',cfg.lab_name);
    setText('access-affiliation',cfg.affiliation);
    setText('access-address',cfg.postal_address);
    setText('delivery-pdf-label',cfg.delivery_pdf_label);
    setText('contact-intro',cfg.contact_intro);
    setHref('access-map-link',cfg.google_maps_link);
    setHref('delivery-pdf-link',cfg.delivery_pdf_path);

    const map=document.getElementById('access-map');
    if(map&&cfg.google_maps_query){
      map.src='https://www.google.com/maps?q='+encodeURIComponent(cfg.google_maps_query)+'&output=embed';
    }

    const formUrl=String(cfg.google_form_url||'').trim();
    const open=document.getElementById('google-form-open');
    const wrap=document.getElementById('google-form-embed-wrap');
    const frame=document.getElementById('google-form-iframe');
    const fallback=document.getElementById('contact-form-fallback');
    if(formUrl && /docs\.google\.com\/forms|forms\.gle/i.test(formUrl)){
      if(open){open.href=formUrl;open.classList.remove('is-hidden');}
      if(fallback) fallback.hidden=true;
      // Published Google Form URLs normally end in /viewform. The embedded form uses ?embedded=true.
      let embedUrl=formUrl;
      if(/forms\.gle/i.test(embedUrl)){
        // Short forms.gle links cannot be transformed reliably, so keep the external button only.
        if(wrap) wrap.classList.add('is-hidden');
        if(fallback) fallback.hidden=false;
      }else{
        embedUrl=embedUrl.replace(/([?&])embedded=true(&|$)/,'$1').replace(/[?&]$/,'');
        embedUrl += (embedUrl.includes('?')?'&':'?')+'embedded=true';
        if(frame) frame.src=embedUrl;
        if(wrap) wrap.classList.remove('is-hidden');
      }
    }else{
      if(open) open.classList.add('is-hidden');
      if(wrap) wrap.classList.add('is-hidden');
      if(fallback){fallback.hidden=false;fallback.querySelector('p').textContent=document.documentElement.lang==='en'?'Please contact the laboratory using the contact details provided on this website.':'お問い合わせは研究室の連絡先までお願いします。';}
    }
  }

  function applyWorkbook(workbook){
    const data = workbookToData(workbook);
    if(typeof window.applyExternalLabData === 'function'){
      window.applyExternalLabData(data);
    }
    applySiteSettings(data.SiteSettings);
    document.documentElement.dataset.dataSource='excel';
    return data;
  }

  function buildLocalPicker(){
    const wrap=document.createElement('div');
    wrap.className='excel-local-loader';
    wrap.innerHTML=`
      <div class="excel-local-loader-copy">
        <strong>${isEnglish?'LOCAL EDIT MODE':'ローカル編集モード'}</strong>
        <span id="excel-local-status">${isEnglish?'Open the Excel file to update this preview.':'Excelファイルを選ぶと、この画面に内容を反映できます。'}</span>
      </div>
      <button type="button" class="excel-local-load-button" id="excel-local-load-button">${isEnglish?'Load Excel data':'Excelデータを読み込む'}</button>
      <input id="excel-local-file" type="file" accept=".xlsx,.xls" hidden>
      <button type="button" class="excel-local-close" id="excel-local-close" aria-label="${isEnglish?'Close':'閉じる'}">×</button>`;
    document.body.appendChild(wrap);

    const input=wrap.querySelector('#excel-local-file');
    const button=wrap.querySelector('#excel-local-load-button');
    const status=wrap.querySelector('#excel-local-status');
    const close=wrap.querySelector('#excel-local-close');

    button.addEventListener('click',()=>input.click());
    close.addEventListener('click',()=>wrap.classList.add('is-minimized'));
    wrap.addEventListener('dblclick',()=>wrap.classList.remove('is-minimized'));

    input.addEventListener('change',async()=>{
      const file=input.files&&input.files[0];
      if(!file) return;
      if(typeof XLSX==='undefined'){
        status.textContent=isEnglish?'Excel reader could not be loaded. Please connect to the internet and reopen the page.':'Excel読込ライブラリを読み込めませんでした。インターネット接続を確認してページを開き直してください。';
        wrap.classList.add('has-error');
        return;
      }
      try{
        button.disabled=true;
        status.textContent=isEnglish?'Loading…':'読み込み中…';
        const buffer=await file.arrayBuffer();
        const workbook=XLSX.read(buffer,{type:'array'});
        applyWorkbook(workbook);
        wrap.classList.remove('has-error');
        wrap.classList.add('is-loaded');
        status.textContent=(isEnglish?'Loaded: ':'読込済み：')+file.name;
        button.textContent=isEnglish?'Reload another Excel':'別のExcelを読み込む';
      }catch(err){
        console.error('Selected Excel could not be loaded.',err);
        wrap.classList.add('has-error');
        status.textContent=isEnglish?'Could not read this Excel file. Please check the workbook format.':'Excelを読み込めませんでした。ファイル形式や内容を確認してください。';
      }finally{
        button.disabled=false;
        input.value='';
      }
    });

    // Drag & drop is also supported for convenience.
    ['dragenter','dragover'].forEach(type=>wrap.addEventListener(type,e=>{
      e.preventDefault(); wrap.classList.add('is-dragging');
    }));
    ['dragleave','drop'].forEach(type=>wrap.addEventListener(type,e=>{
      e.preventDefault(); wrap.classList.remove('is-dragging');
    }));
    wrap.addEventListener('drop',async e=>{
      const file=e.dataTransfer&&e.dataTransfer.files&&e.dataTransfer.files[0];
      if(!file) return;
      if(!/\.xlsx?$/i.test(file.name)){
        status.textContent=isEnglish?'Please drop an .xlsx or .xls file.':'Excel（.xlsx / .xls）をドロップしてください。';
        wrap.classList.add('has-error');
        return;
      }
      try{
        button.disabled=true;
        status.textContent=isEnglish?'Loading…':'読み込み中…';
        const buffer=await file.arrayBuffer();
        const workbook=XLSX.read(buffer,{type:'array'});
        applyWorkbook(workbook);
        wrap.classList.remove('has-error');
        wrap.classList.add('is-loaded');
        status.textContent=(isEnglish?'Loaded: ':'読込済み：')+file.name;
        button.textContent=isEnglish?'Reload another Excel':'別のExcelを読み込む';
      }catch(err){
        console.error(err);
        wrap.classList.add('has-error');
        status.textContent=isEnglish?'Could not read this Excel file.':'Excelを読み込めませんでした。';
      }finally{button.disabled=false;}
    });
  }

  async function loadExcel(){
    if(location.protocol === 'file:'){
      document.documentElement.dataset.dataSource='manual-excel';
      buildLocalPicker();
      return;
    }
    if(typeof XLSX === 'undefined') return;
    try{
      const response = await fetch('data/lab_data.xlsx?ts=' + Date.now(), {cache:'no-store'});
      if(!response.ok) throw new Error('HTTP ' + response.status);
      const buffer = await response.arrayBuffer();
      const workbook = XLSX.read(buffer,{type:'array'});
      applyWorkbook(workbook);
    }catch(err){
      console.warn('Excel data could not be loaded.', err);
      document.documentElement.dataset.dataSource='excel-error';
      const ja=!isEnglish;
      document.querySelectorAll('.data-loading').forEach(el=>{el.textContent=ja?'Excelデータを読み込めませんでした。data/lab_data.xlsx を確認してください。':'Excel data could not be loaded. Please check data/lab_data.xlsx.';el.classList.add('has-error');});
    }
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', loadExcel, {once:true});
  }else{
    loadExcel();
  }
})();
