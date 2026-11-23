// ゆめいろ手帳：📷 プラネットのシフト表のスクショ → CSV（このiPhoneの中だけでOCR。画像はどこにも送らない）＆ 📅 iPhoneカレンダーへ書き出し（2026-11-23）
// いまは試しの段階：読んだ結果は手帳に入れず、CSVにするだけ（本人が確かめてから手で取り込む）
(function(){
const W="日月火水木金土",pad=n=>String(n).padStart(2,"0");
const esc=t=>String(t).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const md=d=>{const[y,m,dd]=d.split("-").map(Number);return`${m}/${dd}(${W[new Date(y,m-1,dd).getDay()]})`};

function css(){if(document.getElementById("siCss"))return;const st=document.createElement("style");st.id="siCss";st.textContent=`
#siBox{position:fixed;inset:0;z-index:10001;background:rgba(60,40,80,.32);display:flex;align-items:center;justify-content:center;padding:14px}
#siBox .cf{width:100%;max-width:380px;max-height:86vh;display:flex;flex-direction:column;background:#fff;border-radius:22px;border:2px solid var(--pink2);box-shadow:0 10px 30px rgba(183,156,255,.4);padding:14px 12px 12px}
#siBox .hd{display:flex;gap:10px;align-items:center;font-size:13.5px;font-weight:700;line-height:1.5;color:var(--ink);margin-bottom:8px}
#siBox .hd img{width:46px;height:46px;border-radius:50%;border:3px solid var(--pink);object-fit:cover;flex:none}
#siBox .ls{overflow:auto;flex:1;border-top:1px dashed #e3d6ff;border-bottom:1px dashed #e3d6ff;padding:4px 0}
#siBox .r{display:flex;align-items:center;gap:8px;padding:3px 2px}
#siBox .r b{width:64px;flex:none;font-size:13px;color:var(--ink)}
#siBox .r span{flex:1;font-size:13.5px;color:var(--ink)}#siBox .r.off span{color:var(--sub)}#siBox .r.warn span{color:#e0447a}
#siBox .r input{flex:1;min-width:0;font:inherit;font-size:14px;padding:6px 8px;border:1.5px solid #e3d6ff;border-radius:10px;background:#fff;color:var(--ink)}
#siBox .r.off input{color:var(--sub)}
#siBox .r .x{border:0;background:none;font-size:16px;cursor:pointer;padding:2px 4px}
#siBox .pg{padding:18px 6px 8px}#siBox .pg .ln{font-size:14px;font-weight:700;color:var(--ink);text-align:center;min-height:1.6em;margin-bottom:22px}
#siBox .pg .tr{position:relative;height:14px;border-radius:99px;background:var(--lav2);margin:0 18px}
#siBox .pg .fl{height:100%;width:0;border-radius:99px;background:linear-gradient(90deg,var(--lav),var(--pink))}
#siBox .pg .bb{position:absolute;top:-30px;left:-18px;width:40px;height:40px;border-radius:50%;border:3px solid var(--pink);object-fit:cover;background:#fff;transition:transform .2s}
#siBox .pg .bb.hop{transform:translateY(-5px)}
#siBox .pg .pc{text-align:center;font-size:12.5px;color:var(--sub);margin-top:10px;font-weight:700}
#siBox .nt{font-size:11.5px;color:var(--sub);margin:6px 2px}
#siBox .b{display:flex;gap:10px;margin-top:8px}
#siBox .b button{flex:1;padding:11px 6px;border:0;border-radius:99px;font:inherit;font-weight:800;font-size:14px;cursor:pointer}
#siBox .no{background:var(--lav2);color:var(--ink)}#siBox .yes{background:linear-gradient(90deg,var(--lav),var(--pink));color:#fff}
body.dark #siBox .cf{background:#2e2747;border-color:#5a3a5c}body.dark #siBox .r input{background:#241e38;border-color:#4a3d6b}body.dark #siBox .no{background:rgba(255,255,255,.12)}`;document.head.appendChild(st)}

// ---- 📷 スクショ → OCR（このiPhoneの中だけ）→ CSV ----
// OCRの部品（Tesseract.js）は最初の1回だけネットから読み込む。画像はどこにも送らない
const TJS="https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js";
let tjsP=null;const loadT=()=>tjsP||(tjsP=new Promise((ok,ng)=>{if(window.Tesseract)return ok(window.Tesseract);const sc=document.createElement("script");sc.src=TJS;sc.onload=()=>window.Tesseract?ok(window.Tesseract):ng(new Error("OCRの部品が読み込めなかったよ"));sc.onerror=()=>{tjsP=null;ng(new Error("OCRの部品が読み込めなかったよ（はじめての1回は電波が必要だよ）"))};document.head.appendChild(sc)}));

async function toGray(file){let img;
  try{img=await createImageBitmap(file)}catch(e){img=await new Promise((ok,ng)=>{const i=new Image();i.onload=()=>ok(i);i.onerror=()=>ng(new Error("画像が開けなかったよ"));i.src=URL.createObjectURL(file)})}
  const r=Math.min(2,1914/img.width),W=Math.round(img.width*r),H=Math.round(img.height*r),c=document.createElement("canvas");c.width=W;c.height=H;
  const x=c.getContext("2d",{willReadFrequently:true});x.fillStyle="#fff";x.fillRect(0,0,W,H);x.drawImage(img,0,0,W,H);
  const d=x.getImageData(0,0,W,H),g=new Uint8Array(W*H);for(let i=0,j=0;i<g.length;i++,j+=4){const v=Math.round(d.data[j]*0.299+d.data[j+1]*0.587+d.data[j+2]*0.114);g[i]=v;d.data[j]=d.data[j+1]=d.data[j+2]=v}
  x.putImageData(d,0,0);return{c,g,W,H}}
// ななめのしましま（オフのマス）の強さ。文字のふちは除いて、ななめ2方向の差をくらべる
function stripeFn(g,W,H){const k=Math.max(3,Math.round(6*W/1914));return(x0,y0,x1,y1)=>{let a=0,b=0,n=0;
  for(let y=Math.max(k,y0|0);y<Math.min(H-k,y1);y+=2)for(let x=Math.max(k,x0|0);x<Math.min(W-k,x1);x+=2){const v=g[y*W+x],p=g[(y+k)*W+x+k],q=g[(y-k)*W+x+k];
    if(Math.max(v,p,q)-Math.min(v,p,q)>60)continue;a+=Math.abs(v-p);b+=Math.abs(v-q);n++}
  if(n<50)return 1;a/=n;b/=n;return Math.max(a,b)/(Math.min(a,b)+1)}}
function crop(g,W,H,[x0,y0,x1,y1]){x0=Math.max(0,x0|0);y0=Math.max(0,y0|0);x1=Math.min(W,x1|0);y1=Math.min(H,y1|0);
  const w=x1-x0,h=y1-y0,c=document.createElement("canvas");c.width=w;c.height=h;const x=c.getContext("2d"),d=x.createImageData(w,h);
  for(let y=0;y<h;y++)for(let i=0;i<w;i++){const v=g[(y0+y)*W+x0+i]>90?255:0,j=(y*w+i)*4;d.data[j]=d.data[j+1]=d.data[j+2]=v;d.data[j+3]=255}
  x.putImageData(d,0,0);return c}
const wordsOf=data=>{let ws=data.words||[];if(!ws.length){ws=[];(data.blocks||[]).forEach(b=>(b.paragraphs||[]).forEach(p=>(p.lines||[]).forEach(l=>(l.words||[]).forEach(w=>ws.push(w)))))}
  return ws.map(w=>({t:w.text,x0:w.bbox.x0,y0:w.bbox.y0,x1:w.bbox.x1,y1:w.bbox.y1}))};

function sheet(){css();let a=document.getElementById("siBox");if(a)a.remove();a=document.createElement("div");a.id="siBox";
  a.innerHTML=`<div class="cf"><div class="hd"><img src="face-guide.webp" alt=""><div class="msg">スクショを読んでるよ…<br><small>このiPhoneの中だけで読んでるから、画像はどこにも送らないよ</small></div></div><div class="ls"></div><div class="nt"></div><div class="b"><button type="button" class="no">とじる</button></div></div>`;
  document.body.appendChild(a);a.querySelector(".no").onclick=()=>a.remove();return a}

// ---- ⏳ 待っている間のプログレスバー（ファーちゃんがバーの上を歩くよ）----
// 本当の進み具合より速くは進まない＋最低 MIN_MS は見られる＋終わったら少し余韻（DONE_MS）
const MIN_MS=8000,DONE_MS=2200;
const LINES={prep:["読みとりの準備をしてるよ…","メガネをかけたよ👓","よーし、がんばるぞ🧸"],
  read:["スクショを読んでるよ…","日付をさがしてるよ📅","時間をメモしてるよ✏️","しましまのマスはオフの日だね","CKINかな？FCかな？🔍","ひとマスずつ見ていくね"],
  again:["読みにくいマスをもう一回見てるよ🔍","有休の日かな？🏖️","ここはまだ出てないみたい…"]};
function progress(a){const box=document.createElement("div");box.className="pg";
  box.innerHTML=`<div class="ln">読みとりの準備をしてるよ…</div><div class="tr"><div class="fl"></div><img class="bb" src="face-talk.webp" alt=""></div><div class="pc">0%</div>`;
  a.querySelector(".ls").before(box);
  const fl=box.querySelector(".fl"),bb=box.querySelector(".bb"),pc=box.querySelector(".pc"),ln=box.querySelector(".ln");
  const t0=performance.now();let target=0,shown=0,stage="prep",li=0,lt=t0,raf=0,doneRes=null;
  const tick=now=>{const cap=Math.min(100,(now-t0)/MIN_MS*100);const goal=Math.min(target,cap);shown+=(goal-shown)*0.06;if(goal-shown<0.05)shown=goal;
    fl.style.width=shown+"%";bb.style.left=`calc(${shown}% - 18px)`;bb.classList.toggle("hop",Math.floor(now/260)%2===0&&shown<99.5);pc.textContent=stage==="done"?"100%":Math.floor(shown)+"%";
    if(stage!=="done"){const st=shown<14?"prep":shown<82?"read":"again"; // 一言はバーの見た目の進みに合わせる
      if(st!==stage){stage=st;li=0;ln.textContent=LINES[st][0];lt=now}else if(now-lt>2300){const L=LINES[stage];li=(li+1)%L.length;ln.textContent=L[li];lt=now}}
    if(doneRes&&shown>=99.5){shown=100;doneRes();doneRes=null}
    raf=requestAnimationFrame(tick)};
  raf=requestAnimationFrame(tick);
  return{set(st,v){target=Math.max(target,v)},
    finish(){target=100;return new Promise(ok=>{doneRes=ok}).then(()=>{stage="done";bb.src="face-yay.webp";bb.classList.remove("hop");ln.textContent="できたよ！🧸✨";pc.textContent="100%";
      return new Promise(ok=>setTimeout(ok,DONE_MS))})},
    stop(){cancelAnimationFrame(raf);box.remove()}}}

let busy=false;
window.shiftImgFlow=async file=>{if(busy)return;busy=true;const a=sheet(),pg=progress(a),msg=t=>{const m=a.querySelector(".msg");if(m)m.innerHTML=t};let w1,w2;
  try{msg("ファーちゃんがシフト表を読んでるよ<br><small>このiPhoneの中だけで読んでるから、画像はどこにも送らないよ</small>");pg.set("prep",3);
    const T=await loadT();pg.set("prep",8);const im=await toGray(file);pg.set("prep",12);
    const pr=(st,a0,a1)=>m=>{if(m&&m.status==="recognizing text")pg.set(st,a0+(a1-a0)*(m.progress||0))};
    w1=await T.createWorker("eng",1,{logger:pr("read",15,80)});await w1.setParameters({tessedit_pageseg_mode:"11"});
    pg.set("read",15);const r1=await w1.recognize(im.c,{},{blocks:true});pg.set("read",80);
    const res=window.PlanetOCR.parsePlanet(wordsOf(r1.data),stripeFn(im.g,im.W,im.H));
    if(!res.days.length&&!res.todo.length)throw new Error(res.why||"シフト表が見つからなかったよ");
    if(res.todo.length){w2=await T.createWorker("jpn+eng",1,{logger:pr("again",82,84)});await w2.setParameters({tessedit_pageseg_mode:"6"});
      let ti=0;for(const it of res.todo){pg.set("again",84+14*(ti++/res.todo.length));const r=await w2.recognize(crop(im.g,im.W,im.H,it.box));const c=window.PlanetOCR.classify(r.data.text,it);if(c)res.days.push(c)}}
    res.days.sort((x,y)=>x.d<y.d?-1:1);
    const csv=window.PlanetOCR.toCSV(res.days);
    await pg.finish();pg.stop();
    msg(`${res.days.length}日分のCSVができたよ！<br><small>まだ手帳には入れてないよ。まちがいがないか確かめてね</small>`);
    a.querySelector(".ls").innerHTML=res.days.map(x=>`<div class="r${x.k==="work"?"":" off"}${x.k==="other"?" warn":""}"><b>${md(x.d)}</b><span>${esc(x.title)}</span></div>`).join("");
    a.querySelector(".nt").textContent="ピンクの行は読みとりがあやしい日だよ。「📋 コピー」か「📤 CSVを保存」で書き出して、プラネットの画面と見くらべてね";
    const b=a.querySelector(".b");b.insertAdjacentHTML("beforeend",`<button type="button" class="yes cp">📋 コピー</button><button type="button" class="yes sv">📤 CSVを保存</button>`);
    b.querySelector(".cp").onclick=async()=>{try{await navigator.clipboard.writeText(csv);yuAlert("🧸 CSVをコピーしたよ")}catch(e){yuAlert("⚠️ コピーできなかったよ。「CSVを保存」を使ってね")}};
    b.querySelector(".sv").onclick=async()=>{const nm=`シフト_${res.days[0].d.slice(0,7)}_スクショ.csv`,f=new File(["﻿"+csv],nm,{type:"text/csv"});
      if(navigator.canShare&&navigator.canShare({files:[f]})){try{await navigator.share({files:[f]});return}catch(e){if(e&&e.name==="AbortError")return}}
      const u=URL.createObjectURL(f),l=document.createElement("a");l.href=u;l.download=nm;document.body.appendChild(l);l.click();l.remove();setTimeout(()=>URL.revokeObjectURL(u),60000)};
  }catch(e){pg.stop();msg("⚠️ うまく読めなかったよ…<br><small>"+esc(String(e&&e.message||e).slice(0,100))+"</small>")}
  finally{busy=false;try{w1&&w1.terminate()}catch(e){}try{w2&&w2.terminate()}catch(e){}}};

// ---- 📅 iPhoneのカレンダーへ書き出し（前の晩21時に通知）----
function ics(){if(typeof SHIFTS!=="object")throw new Error("シフトが見つからなかったよ");
  const now=new Date(Date.now()+9*3600e3),today=now.toISOString().slice(0,10);
  const ds=Object.keys(SHIFTS).filter(d=>d>=today).sort();
  const t=m=>`${pad(Math.floor(m/60)%24)}${pad(m%60)}00`,hm=m=>`${pad(Math.floor(m/60)%24)}:${pad(m%60)}`;
  const dd=(d,plus=0)=>{const[y,m,x]=d.split("-").map(Number),o=new Date(Date.UTC(y,m-1,x+plus));return o.toISOString().slice(0,10).replace(/-/g,"")};
  const stamp=new Date().toISOString().replace(/[-:]/g,"").slice(0,15)+"Z";
  const L=["BEGIN:VCALENDAR","VERSION:2.0","PRODID:-//yumeiro-techo//shift//JA","CALSCALE:GREGORIAN",
    "BEGIN:VTIMEZONE","TZID:Asia/Tokyo","BEGIN:STANDARD","DTSTART:19700101T000000","TZOFFSETFROM:+0900","TZOFFSETTO:+0900","TZNAME:JST","END:STANDARD","END:VTIMEZONE"];
  let n=0;
  for(const d of ds){const sh=SHIFTS[d];if(!sh)continue;const ttl=String(sh.title||"").replace(/[,;\\]/g," ").trim();
    if(!sh.off&&sh.start!=null&&sh.end!=null){
      const lab=(ttl.match(/^[A-Za-z]+/)||["シフト"])[0],end=sh.end>sh.start?sh.end:sh.end+1440;
      L.push("BEGIN:VEVENT",`UID:${d}-shift@yumeiro-techo`,`DTSTAMP:${stamp}`,`DTSTART;TZID=Asia/Tokyo:${dd(d)}T${t(sh.start)}`,`DTEND;TZID=Asia/Tokyo:${dd(d,end>=1440?1:0)}T${t(end)}`,
        `SUMMARY:${lab} ${hm(sh.start)}-${hm(sh.end)}`,
        "BEGIN:VALARM","ACTION:DISPLAY",`DESCRIPTION:🧸 明日は ${lab} ${hm(sh.start)}からだよ`,`TRIGGER:-PT${sh.start+180}M`,"END:VALARM","END:VEVENT");n++}
    else if(sh.off&&!/公休/.test(ttl)){ // 公休日は入れない。有休・特休などだけ終日の予定に
      L.push("BEGIN:VEVENT",`UID:${d}-shift@yumeiro-techo`,`DTSTAMP:${stamp}`,`DTSTART;VALUE=DATE:${dd(d)}`,`DTEND;VALUE=DATE:${dd(d,1)}`,`SUMMARY:${ttl.replace(/（お休み）/,"")||"お休み"}`,"END:VEVENT");n++}}
  L.push("END:VCALENDAR");return{text:L.join("\r\n")+"\r\n",n,from:ds[0],to:ds[ds.length-1]}}

async function exportIcs(){try{const r=ics();if(!r.n){yuAlert("⚠️ 今日から先のシフトがないみたい。先にシフトを読み込んでね");return}
  const f=new File([r.text],"yumeiro-shift.ics",{type:"text/calendar"});
  if(navigator.canShare&&navigator.canShare({files:[f]})){try{await navigator.share({files:[f],title:"シフト"});return}catch(e){if(e&&e.name==="AbortError")return}}
  const u=URL.createObjectURL(f),a=document.createElement("a");a.href=u;a.download=f.name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),60000);
  yuAlert(`🧸 ${r.n}日分のカレンダーファイルを作ったよ（${md(r.from)}〜${md(r.to)}）`)}
  catch(e){yuAlert("⚠️ 書き出せなかったよ…"+String(e&&e.message||e).slice(0,80))}}

function addBtn(){const st=document.getElementById("csvStatus");if(!st||document.getElementById("icsOut"))return;
  const b=document.createElement("button");b.id="icsOut";b.type="button";b.className="btn2 sub";
  b.style.cssText="font-family:inherit;cursor:pointer;font-size:12px;margin-top:6px";b.textContent="📅 iPhoneのカレンダーに書き出す（前の晩21時にお知らせ）";
  b.onclick=exportIcs;st.parentNode.insertBefore(b,st.nextSibling)}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",addBtn);else addBtn();
})();
