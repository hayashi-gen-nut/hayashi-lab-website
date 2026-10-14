import {NextRequest,NextResponse} from 'next/server';
export const runtime='nodejs';
const defaults=['Engineering Structures','Composite Structures','Journal of Bridge Engineering','Structure and Infrastructure Engineering','Journal of Composites for Construction','Journal of Constructional Steel Research','Thin-Walled Structures','Journal of Civil Structural Health Monitoring','International Journal of Steel Structures'];
type Work={DOI?:string;title?:string[];URL?:string;published?:{'date-parts'?:number[][]};'published-online'?:{'date-parts'?:number[][]};'container-title'?:string[];author?:{given?:string;family?:string;name?:string}[]};
const norm=(s:string)=>s.toLowerCase().replace(/[^a-z0-9]/g,'');
const knownIssn:Record<string,string>={
 'Engineering Structures':'0141-0296',
 'Composite Structures':'0263-8223',
 'Journal of Bridge Engineering':'1084-0702',
 'Structure and Infrastructure Engineering':'1573-2479',
 'Journal of Composites for Construction':'1090-0268',
 'Journal of Constructional Steel Research':'0143-974X',
 'Thin-Walled Structures':'0263-8231',
 'Journal of Civil Structural Health Monitoring':'2190-5452',
 'International Journal of Steel Structures':'1598-2351'
};
async function crossref(url:string){const response=await fetch(url,{headers:{'User-Agent':'ResearchLabHub/1.0 (academic journal discovery)','Accept':'application/json'},signal:AbortSignal.timeout(16000),next:{revalidate:900}});if(!response.ok)throw new Error('Crossref HTTP '+response.status);return response.json()}
export async function GET(req:NextRequest){
 const q=req.nextUrl.searchParams;const all=q.get('all')==='1';const selected=(q.get('title')||'').trim();const titles=all?(q.get('titles')||defaults.join('|')).split('|').map(t=>t.trim()).filter(Boolean).slice(0,30):[selected];
 if(!titles.length||titles.some(t=>!t||t.length>180))return NextResponse.json({error:'Invalid journal selection'},{status:400});
 const offset=Math.min(10000,Math.max(0,Number(q.get('offset'))||0));const rows=Math.min(100,Math.max(1,Number(q.get('rows'))||50));const days=[0,7,30,90,365].includes(Number(q.get('days')))?Number(q.get('days')):30;
 const since=new Date();since.setUTCDate(since.getUTCDate()-days);const filter=days?'&filter='+encodeURIComponent('from-pub-date:'+since.toISOString().slice(0,10)):'';
 const results:{title:string;url:string;date:string;journal:string;doi:string;authors:string}[]=[];const warnings:string[]=[];let more=false;
 // Run requests in small batches to avoid overwhelming Crossref. One journal failure must not erase the others.
 for(let i=0;i<titles.length;i+=3){await Promise.all(titles.slice(i,i+3).map(async title=>{
  try{
   let works:Work[]=[];
   try{let issn=knownIssn[title];if(!issn){const lookup=await crossref('https://api.crossref.org/journals?query.title='+encodeURIComponent(title)+'&rows=15');const candidates=lookup.message?.items||[];const exact=candidates.find((j:{title?:string})=>norm(j.title||'')===norm(title));issn=exact?.ISSN?.[0]||'';}
    if(issn){const data=await crossref('https://api.crossref.org/journals/'+encodeURIComponent(issn)+'/works?sort=published&order=desc&rows='+rows+'&offset='+offset+filter);works=data.message?.items||[];}
   }catch(e){warnings.push(title+': ISSN lookup unavailable; using title search');}
   if(!works.length){const data=await crossref('https://api.crossref.org/works?query.container-title='+encodeURIComponent(title)+'&sort=published&order=desc&rows='+rows+'&offset='+offset+filter);works=(data.message?.items||[]).filter((w:Work)=>(w['container-title']||[]).some(n=>norm(n)===norm(title)));}
   more=more||works.length===rows;
   for(const w of works){const dp=w['published-online']?.['date-parts']?.[0]||w.published?.['date-parts']?.[0]||[];results.push({title:w.title?.[0]||'Untitled',url:w.DOI?'https://doi.org/'+w.DOI:w.URL||'',date:dp.map((v:number,k:number)=>k?String(v).padStart(2,'0'):String(v)).join('-'),journal:title,doi:w.DOI||'',authors:(w.author||[]).slice(0,8).map(a=>[a.given,a.family].filter(Boolean).join(' ')||a.name||'').filter(Boolean).join(', ')})}
  }catch(e){warnings.push(title+': '+(e instanceof Error?e.message:String(e)))}
 }))}
 const unique=[...new Map(results.map(x=>[x.doi||x.url||x.title,x])).values()].sort((a,b)=>b.date.localeCompare(a.date));
 // Empty results are not a fatal application error. Preserve diagnostic warnings for the UI.
 if(!unique.length&&warnings.length===titles.length)return NextResponse.json({items:[],offset,rows,hasMore:false,warnings,journalCount:titles.length});
 return NextResponse.json({items:unique,offset,rows,hasMore:more,warnings,journalCount:titles.length});
}
