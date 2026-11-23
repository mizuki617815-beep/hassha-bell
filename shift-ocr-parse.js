// ゆめいろ手帳：プラネットのシフト表（スクショ）をOCRした「単語と位置」から、日付ごとのシフトを組み立てる（2026-11-23）
// 画像もOCRもこのiPhoneの中だけ。ここは文字の並びを読むだけの部品（ブラウザでもnodeでも動く）
// words: [{t:"文字", x0,y0,x1,y1}]（画像のピクセル座標）、stripeOf(x0,y0,x1,y1): ななめのしましまの強さ（オフの判定用。2以上ならしましま）
// 読めなかったマスは todo に入れて返す → 呼び出し側でそのマスだけ切り出してもう一度OCR → classify() で決める
(function(root){
const RE_DATE=/^(\d{2})\/(\d{2})\/(\d{4})$/, RE_RANGE=/(\d{1,2}):(\d{2})\s*[-–—~]\s*(\d{1,2}):(\d{2})/, RE_HM=/^(\d{1,2}):(\d{2})$/;
const p2=n=>String(n).padStart(2,"0");

function rows(ws){ // 単語を行にまとめる（上下の中心が近いもの同士）
  const s=[...ws].sort((a,b)=>(a.y0+a.y1)/2-(b.y0+b.y1)/2),out=[];
  for(const w of s){const cy=(w.y0+w.y1)/2,hh=(w.y1-w.y0);const r=out.find(r=>Math.abs(r.cy-cy)<Math.max(6,hh*0.55));
    if(r){r.ws.push(w);r.cy=(r.cy*(r.ws.length-1)+cy)/r.ws.length}else out.push({cy,ws:[w]})}
  return out.sort((a,b)=>a.cy-b.cy).map(r=>r.ws.sort((a,b)=>a.x0-b.x0).map(w=>w.t).join(" "))}

function roleOf(line){const t=line.toUpperCase().replace(/\s+/g," ");
  if(/\bMEAL\b|\bBREAK\b|PRE\s*D-?1/.test(t))return null; // 食事・休憩・前日準備は数えない
  const f=(t.match(/\b(\d{3})\b/)||[])[1]||"";
  if(/\bFC\b/.test(t))return{f,r:"FC"};
  if(/\bCK[I1lL|]?\b/.test(t))return{f,r:"CKIN"};
  if(/\bLNG\b/.test(t))return{f,r:"LNG"};
  if(/\bG\/?L\b|\bPRE\b|\bBGR\b/.test(t))return{f,r:""}; // 業務名には出ないけど「何行あるか」には数える
  return null}

// 業務名：便ごとにまとめて、FC＞CKIN＞LNG。2便目は2行以上あるとき（またはFC）だけ。同じなら1つ
function label(lines){const fl=[];
  for(const l of lines){const x=roleOf(l);if(!x)continue;let g=fl.find(g=>g.f===x.f);if(!g){g={f:x.f,n:0,rs:new Set()};fl.push(g)}g.n++;if(x.r)g.rs.add(x.r)}
  const pick=g=>g.rs.has("FC")?"FC":g.rs.has("CKIN")?"CKIN":g.rs.has("LNG")?"LNG":"";
  const out=[];fl.forEach((g,i)=>{const r=pick(g);if(!r)return;if(i>0&&g.n<2&&r!=="FC")return;if(out[out.length-1]!==r||r==="FC")out.push(r)}); // FC→FCはそのまま、CKINが続くときは1つ（TimeTreeの書き方に合わせる）
  return out.join("→")}

function parsePlanet(words,stripeOf){
  const ws=words.map(w=>({...w,t:String(w.t||"").trim()})).filter(w=>w.t);
  const ds=ws.filter(w=>RE_DATE.test(w.t)).map(w=>{const[,d,m,y]=w.t.match(RE_DATE);return{...w,iso:`${y}-${m}-${d}`,cx:(w.x0+w.x1)/2,cy:(w.y0+w.y1)/2}});
  if(!ds.length)return{days:[],why:"日付が見つからなかったよ"};
  // 日付の行（週ごと）
  const hdr=[];for(const d of [...ds].sort((a,b)=>a.cy-b.cy)){const r=hdr.find(r=>Math.abs(r.cy-d.cy)<(d.y1-d.y0));if(r)r.ds.push(d);else hdr.push({cy:d.cy,y1:d.y1,ds:[d]})}
  hdr.forEach(r=>{r.ds.sort((a,b)=>a.cx-b.cx);r.y1=Math.max(...r.ds.map(d=>d.y1))});
  const colW=(()=>{const g=[];hdr.forEach(r=>{for(let i=1;i<r.ds.length;i++)g.push(r.ds[i].cx-r.ds[i-1].cx)});g.sort((a,b)=>a-b);return g.length?g[Math.floor(g.length/2)]:200})();
  const days=[],todo=[];
  hdr.forEach((r,ri)=>{const top=r.y1+2,bot=ri+1<hdr.length?Math.min(...hdr[ri+1].ds.map(d=>d.y0))-2:top+colW*2.6;
    r.ds.forEach(d=>{const x0=d.cx-colW/2,x1=d.cx+colW/2;
      const cell=ws.filter(w=>{const cx=(w.x0+w.x1)/2,cy=(w.y0+w.y1)/2;return cx>x0&&cx<x1&&cy>top&&cy<bot&&!RE_DATE.test(w.t)});
      const lines=rows(cell),all=lines.join(" ");
      const m=all.match(RE_RANGE);
      if(m){const s=`${p2(m[1])}${m[2]}`,e=`${p2(m[3])}${m[4]}`,lb=label(lines);
        days.push({d:d.iso,k:"work",s,e,title:`CX ${lb?lb+" ":""}${s}-${e}`,raw:all});return}
      if(isLeave(all)){days.push({d:d.iso,k:"leave",title:"お休み(有休)",raw:all});return}
      const st=stripeOf?stripeOf(x0+colW*0.1,top+(bot-top)*0.08,x1-colW*0.1,bot-(bot-top)*0.08):0;
      if(st>=1.8){days.push({d:d.iso,k:"off",title:"お休み",raw:all});return}
      todo.push({d:d.iso,box:[Math.max(0,x0+colW*0.04),top,x1-colW*0.04,bot],raw:all});
      // それ以外（スケジュール不可・空）は入れない
    })});
  days.sort((a,b)=>a.d<b.d?-1:1);
  return{days,todo,colW}}

// もう一度読んだマスの文字から決める（時刻→出勤、「L」や8:00→有休、ほかの英数字→とくべつ、なにもない・スケジュール不可→入れない）
function classify(t,item){const all=String(t||"").replace(/\s+/g," ").trim(),m=all.match(RE_RANGE);
  if(m){const s=`${p2(m[1])}${m[2]}`,e=`${p2(m[3])}${m[4]}`,lb=label(String(t||"").split(/\n+/));return{d:item.d,k:"work",s,e,title:`CX ${lb?lb+" ":""}${s}-${e}`,raw:all}}
  if(isLeave(all))return{d:item.d,k:"leave",title:"お休み(有休)",raw:all};
  if(/スケ|ジュ|不可/.test(all)||all.replace(/[^A-Za-z]/g,"").length<3)return null;
  return{d:item.d,k:"other",title:all.slice(0,30),raw:all}}
function isLeave(all){return !RE_RANGE.test(all)&&(/(^|\s)[IL|]{1,2}(\s|$)/.test(all)||/(^|\s)0?8[:.]00(\s|$)/.test(all))}

function toCSV(days){const q=v=>/[",\n]/.test(v)?`"${String(v).replace(/"/g,'""')}"`:v;
  return "date,title,category\n"+days.map(x=>`${x.d},${q(x.title)},${x.k==="work"?"CX":q(x.title)}`).join("\n")+"\n"}

const api={parsePlanet,classify,toCSV,label};
if(typeof module!=="undefined"&&module.exports)module.exports=api;else root.PlanetOCR=api;
})(typeof window!=="undefined"?window:globalThis);
