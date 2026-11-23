// ゆめいろ手帳：📷 プラネットのシフト表のスクショ → CSV（このiPhoneの中だけでOCR。画像はどこにも送らない）＆ 🌳 TimeTree用に書き出し（2026-11-23）
// 読んだ結果を一覧で確かめて「手帳に入れる」で取り込む（2026-11-23 ステップ2。CSVはオプション）
(function(){
const W="日月火水木金土",pad=n=>String(n).padStart(2,"0");
const esc=t=>String(t).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const md=d=>{const[y,m,dd]=d.split("-").map(Number);return`${m}/${dd}(${W[new Date(y,m-1,dd).getDay()]})`};

function css(){if(document.getElementById("siCss"))return;const st=document.createElement("style");st.id="siCss";st.textContent=`
#siBox{position:fixed;inset:0;z-index:10001;background:rgba(60,40,80,.32);display:flex;align-items:center;justify-content:center;padding:calc(env(safe-area-inset-top) + 8px) 8px calc(env(safe-area-inset-bottom) + 8px);overscroll-behavior:contain;touch-action:none}
html:has(#siBox),body:has(#siBox){overflow:hidden!important;overscroll-behavior:none}
#siBox .ls,#siBox textarea{overscroll-behavior:contain;touch-action:pan-y;-webkit-overflow-scrolling:touch}#siBox input,#siBox button{touch-action:manipulation}
#siBox.full .cf{height:100%}
#siBox .cf{width:100%;max-width:480px;max-height:100%;box-sizing:border-box;display:flex;flex-direction:column;background:#fff;border-radius:22px;border:2px solid var(--pink2);box-shadow:0 10px 30px rgba(183,156,255,.4);padding:14px 12px 12px}
#siBox .hd{display:flex;gap:10px;align-items:center;font-size:13.5px;font-weight:700;line-height:1.5;color:var(--ink);margin-bottom:8px}
#siBox .hd img{width:46px;height:46px;border-radius:50%;border:3px solid var(--pink);object-fit:cover;flex:none}
#siBox .ls{overflow:auto;flex:1;min-height:0;border-top:1px dashed #e3d6ff;border-bottom:1px dashed #e3d6ff;padding:4px 0}
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
    if(!res.days.length&&!res.todo.length){const er=new Error(res.why||"シフト表が見つからなかったよ");er.notShift=true;throw er}
    if(res.todo.length){w2=await T.createWorker("jpn+eng",1,{logger:pr("again",82,84)});await w2.setParameters({tessedit_pageseg_mode:"6"});
      let ti=0;for(const it of res.todo){pg.set("again",84+14*(ti++/res.todo.length));const r=await w2.recognize(crop(im.g,im.W,im.H,it.box));const c=window.PlanetOCR.classify(r.data.text,it);if(c)res.days.push(c)}}
    if(!res.days.length){const er=new Error("シフトが読みとれなかったよ");er.notShift=true;throw er}
    res.days.sort((x,y)=>x.d<y.d?-1:1);
    const csv=window.PlanetOCR.toCSV(res.days);
    await pg.finish();pg.stop();
    a.classList.add("full");
    const ym=res.days[0].d.slice(0,7);
    msg(`${+ym.slice(5)}月のシフトを${res.days.length}日分読んだよ！<br><small>プラネットの画面と見くらべて、合ってたら「📒 手帳に入れる」を押してね</small>`);
    const am=animalMap(),emo=x=>{if(x.k!=="work"||typeof shiftFromTitle!=="function")return"";const sh=shiftFromTitle(x.title);return sh&&!sh.off&&sh.start!=null?(am[keyOf(sh.start,sh.end)]||"❓")+" ":""};
    a.querySelector(".ls").innerHTML=res.days.map(x=>`<div class="r${x.k==="work"?"":" off"}${x.k==="other"?" warn":""}"><b>${md(x.d)}</b><span>${emo(x)}${esc(x.title)}</span></div>`).join("");
    a.querySelector(".nt").innerHTML=`ピンクの行は読みとりがあやしい日だよ。入れる前に今のシフトの控えを残すから、まちがってても「↩️ 消したシフトを復元」で戻せるよ　<a href="#" class="sv" style="color:var(--sub)">📤 CSVで保存</a>`;
    const b=a.querySelector(".b");b.insertAdjacentHTML("beforeend",`<button type="button" class="yes in">📒 手帳に入れる</button>`);
    // ステップ2（2026-11-23）：読んだシフトをそのまま手帳へ。保存すると勤怠のスプレッドシートでほかの端末ともそろう
    b.querySelector(".in").onclick=()=>{
      if(typeof SHIFTS!=="object"||typeof shiftFromTitle!=="function"||typeof saveShifts!=="function"){yuAlert("⚠️ 手帳に入れられなかったよ。開きなおしてもう一回やってみてね");return}
      try{if(typeof backupShifts==="function")backupShifts()}catch(e){}
      let n=0;const skip=[];
      for(const x of res.days){const sh=shiftFromTitle(x.title);if(sh){SHIFTS[x.d]=sh;n++}else skip.push(md(x.d))}
      saveShifts();
      try{if(typeof renderShiftStatus==="function")renderShiftStatus();if(typeof applyShiftForDate==="function")applyShiftForDate(true);if(typeof renderCheer==="function")renderCheer(true);if(typeof renderPaid==="function")renderPaid();if(typeof render==="function")render()}catch(e){}
      const fc=a.querySelector(".hd img");if(fc)fc.src="face-yay.webp";
      msg(`${n}日分を手帳に入れたよ！🧸✨<br><small>${skip.length?`読めなかった日（${skip.join("・")}）は入れてないよ。あとで手で直してね<br>`:""}つぎは「🌳 TimeTreeへ送る」だよ</small>`);
      a.querySelector(".nt").textContent="入れる前のシフトは控えに残してあるよ。まちがってたら勤怠ノートの「↩️ 消したシフトを復元」で戻せるよ";
      b.innerHTML=`<button type="button" class="no">とじる</button><button type="button" class="yes tt">🌳 TimeTreeへ送る</button>`;
      b.querySelector(".no").onclick=()=>a.remove();b.querySelector(".tt").onclick=()=>ttFlow(ym)};
    a.querySelector(".sv").onclick=async ev=>{ev.preventDefault();const nm=`シフト_${ym}_スクショ.csv`,f=new File(["\uFEFF"+csv],nm,{type:"text/csv"});
      if(navigator.canShare&&navigator.canShare({files:[f]})){try{await navigator.share({files:[f]});return}catch(e){if(e&&e.name==="AbortError")return}}
      const u=URL.createObjectURL(f),l=document.createElement("a");l.href=u;l.download=nm;document.body.appendChild(l);l.click();l.remove();setTimeout(()=>URL.revokeObjectURL(u),60000)};
  }catch(e){pg.stop();const fc=a.querySelector(".hd img");if(fc)fc.src="face-oops.webp";
    const em=String(e&&e.message||e);
    if(e&&e.notShift){msg("あれれ…これ、シフト表じゃないみたい💦<br><small>プラネットのシフト表のスクショを選んでね。日付と時間が見えるように、1か月分が入った画面を撮ってくれたら読めるよ🧸</small>")}
    else{msg("ごめんね、うまく読めなかったよ…💦<br><small>"+esc(em.slice(0,100))+"</small>")}}
  finally{busy=false;try{w1&&w1.terminate()}catch(e){}try{w2&&w2.terminate()}catch(e){}}};

// ---- 🌳 TimeTreeへ送る（2026-11-23）：GAS経由でGoogleカレンダー「ゆめいろシフト」に入れる → TimeTreeの「外部カレンダーの予定をインポート」で取り込む ----
// 出勤の日は「シフト名」と「動物の絵文字」を別々の終日予定に。お休みは「お休み」「お休み(有休)」のまま。お知らせはつけない
// 動物は出勤-退勤のセットで決まる。基本の一覧（TimeTreeのメモ「予定の動物たち」）はアプリに入れてOKと本人了承（2026-11-23）。
// 新しい時間・入れ替えは設定（S.animals）に保存して基本の一覧より優先。勤怠のスプレッドシートで他の端末ともそろう
const AK="yumebell-animals";
const BASE_ANIMALS="🐆 06:15-10:15|🦐 06:15-10:30|🐇 06:15-15:15|🦮 06:15-15:30|🐦\u200d🔥 06:15-16:30|🦀 06:15-16:45|🐒 06:20-10:50|🦕 06:20-11:20|🦝 06:20-11:30|🦚 06:20-11:45|🐪 06:20-14:20|🪼 06:20-14:30|🦦 06:20-14:40|🐡 06:20-14:50|🐝 06:20-15:30|🐿 06:20-16:00|🦘 06:20-16:10|🕊 06:20-16:20|🐏 06:20-16:30|🍯 06:20-16:40|🦔 06:20-16:45|🦥 06:20-16:50|🦈 06:20-17:00|🐬 06:30-15:00|🦉 06:30-16:30|🐮 06:40-10:50|🐻\u200d❄️ 06:40-11:45|🐅 06:40-15:10|🐓 06:40-15:30|🐄 06:40-16:20|🦒 06:40-16:30|🧸 06:40-16:40|🐰 06:40-16:45|🐳 06:40-16:50|🐧 06:45-16:30|🦅 06:45-16:45|🐁 06:45-18:00|🐩 06:50-16:30|🦭 06:50-16:45|🦧 06:50-17:00|🐘 07:00-15:30|🐈\u200d⬛ 07:00-16:00|🐍 07:00-16:30|🦑 07:00-17:00|🐢 07:30-16:00|🐷 07:30-17:00|🦩 08:00-16:00|🦜 08:00-16:30|🐙 08:20-16:50|🐣 08:30-16:30|🦌 11:30-16:20|🦁 11:30-16:30|🐌 11:30-16:50|🐈 11:45-16:45|🦋 11:50-16:50".split("|").join("\n");
// 追加・変更は設定（S.animals）に入れる＝勤怠のスプレッドシートで夫の端末ともそろう
const hasS=()=>typeof S==="object"&&S&&typeof save==="function";
try{const old=localStorage.getItem(AK);if(old&&hasS()&&!S.animals){S.animals=old;save()}if(old&&hasS())localStorage.removeItem(AK)}catch(e){}
const lsGet=()=>{if(hasS())return String(S.animals||"");try{return localStorage.getItem(AK)||""}catch(e){return""}};
const lsSet=v=>{if(hasS()){S.animals=v;save();return}try{localStorage.setItem(AK,v)}catch(e){}};
const k4=m=>pad(Math.floor(m/60)%24)+pad(m%60);
const keyOf=(a,b)=>k4(a)+"-"+k4(b);
function parseAnimals(text){const map={};
  String(text||"").split(/\r?\n/).forEach(l=>{const m=l.match(/^\s*(.*?)\s*(\d{1,2})\s*[:：]?\s*(\d{2})\s*[-–ー~〜]\s*(\d{1,2})\s*[:：]?\s*(\d{2})/);
    if(!m)return;const e=m[1].trim();if(!e)return;map[keyOf(+m[2]*60+ +m[3],+m[4]*60+ +m[5])]=e});return map}
const fmtKey=k=>k.slice(0,2)+":"+k.slice(2,4)+"-"+k.slice(5,7)+":"+k.slice(7);

const animalMap=()=>Object.assign(parseAnimals(BASE_ANIMALS),parseAnimals(lsGet()));
function animalSheet(after){css();let a=document.getElementById("siBox");if(a)a.remove();a=document.createElement("div");a.id="siBox";
  const n=Object.keys(animalMap()).length;
  a.innerHTML=`<div class="cf"><div class="hd"><img src="face-talk.webp" alt=""><div class="msg">動物の追加・変更🐾<br><small>いまは${n}組おぼえてるよ。新しい時間や入れかえた動物だけ「🐧 06:45-16:30」の形で書いてね（基本の一覧より優先して、スプレッドシートでほかの端末ともそろうよ）</small></div></div>
  <textarea class="at" rows="10" style="width:100%;box-sizing:border-box;font:inherit;font-size:14px;padding:8px;border:1.5px solid #e3d6ff;border-radius:12px;resize:vertical" placeholder="🐝 06:20-15:30&#10;🐿️ 06:20-16:00"></textarea>
  <div class="nt">TimeTreeのメモをまるごと貼ってもOKだよ</div>
  <div class="b"><button type="button" class="no">とじる</button><button type="button" class="yes">💾 保存</button></div></div>`;
  document.body.appendChild(a);const ta=a.querySelector(".at");ta.value=lsGet();
  a.querySelector(".no").onclick=()=>a.remove();
  a.querySelector(".yes").onclick=()=>{const c=Object.keys(parseAnimals(ta.value)).length;
    if(ta.value.trim()&&!c){yuAlert("⚠️ 時間が読めなかったよ。「🐝 06:20-15:30」みたいな形で貼ってね");return}
    lsSet(ta.value);a.remove();yuAlert(`🧸 保存したよ（ぜんぶで${Object.keys(animalMap()).length}組）`);if(after)after()}}

const monthsOf=()=>{if(typeof SHIFTS!=="object")return[];const now=new Date(Date.now()+9*3600e3).toISOString().slice(0,7);
  return[...new Set(Object.keys(SHIFTS).map(d=>d.slice(0,7)))].filter(m=>m>=now).sort()};

function ttFlow(pre){if(typeof SHIFTS!=="object"||!Object.keys(SHIFTS).length){yuAlert("⚠️ シフトがまだないみたい。先にシフトを読み込んでね");return}
  const ms=monthsOf();if(!ms.length){yuAlert("⚠️ 今月から先のシフトがないみたい");return}
  css();let a=document.getElementById("siBox");if(a)a.remove();a=document.createElement("div");a.id="siBox";a.className="full";
  a.innerHTML=`<div class="cf"><div class="hd"><img src="face-guide.webp" alt=""><div class="msg">TimeTreeへ送るよ🌳<br><small>どの月にする？ Googleカレンダーの「ゆめいろシフト」に入れるから、そのあとTimeTreeで取り込んでね</small></div></div>
  <div class="mo" style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:6px"></div><div class="ls"></div><div class="nt ft"></div>
  <div class="b"><button type="button" class="no">とじる</button><button type="button" class="yes go">🌳 TimeTreeへ送る</button></div>
  <div style="text-align:center;margin-top:8px"><button type="button" class="ed" style="border:0;background:none;font:inherit;font-size:12px;color:var(--sub);text-decoration:underline;cursor:pointer">🐾 動物の追加・変更</button></div></div>`;
  document.body.appendChild(a);a.querySelector(".no").onclick=()=>a.remove();a.querySelector(".ed").onclick=()=>animalSheet(ttFlow);
  let cur=typeof pre==="string"&&ms.includes(pre)?pre:ms[0];const mo=a.querySelector(".mo");
  const draw=()=>{mo.innerHTML=ms.map(m=>`<button type="button" data-m="${m}" class="${m===cur?"yes":"no"}" style="flex:none;padding:6px 12px;border:0;border-radius:99px;font:inherit;font-weight:800;font-size:13px;cursor:pointer">${+m.slice(5)}月</button>`).join("");
    mo.querySelectorAll("button").forEach(b=>b.onclick=()=>{cur=b.dataset.m;draw()});
    const map=animalMap(),ds=Object.keys(SHIFTS).filter(d=>d.startsWith(cur)).sort();
    const rows=ds.map(d=>{const sh=SHIFTS[d],work=!sh.off&&sh.start!=null&&sh.end!=null,k=work?keyOf(sh.start,sh.end):"";return{d,title:sh.title||(sh.off?"お休み":""),work,k,emoji:work?map[k]||"":""}});
    const miss=[...new Set(rows.filter(r=>r.work&&!r.emoji).map(r=>r.k))];
    a.querySelector(".ls").innerHTML=(miss.length?`<div class="nt" style="color:#e0447a;font-weight:700">🧸 この時間の動物がまだ決まってないよ。絵文字を入れてね</div>`+miss.map(k=>`<div class="r warn"><b style="width:104px">${fmtKey(k)}</b><input data-k="${k}" placeholder="🐾 絵文字" maxlength="8"></div>`).join("")+`<div style="height:6px"></div>`:"")
      +rows.map(r=>`<div class="r${r.work?"":" off"}"><b>${md(r.d)}</b><span>${r.work?(r.emoji||"❓")+" ":""}${esc(r.title)}</span></div>`).join("");
    a.querySelector(".ft").textContent=miss.length?"":`${rows.length}日分。出勤の日は「シフト」と「動物」が別々の終日予定になるよ`;
    a.querySelector(".go").onclick=async()=>{
      const add=[];for(const inp of a.querySelectorAll("input[data-k]")){const v=inp.value.trim();if(!v){yuAlert("⚠️ まだ決まってない動物があるよ");inp.focus();return}add.push(v+" "+fmtKey(inp.dataset.k))}
      if(add.length){lsSet(lsGet().replace(/\s*$/,"")+"\n"+add.join("\n"));draw();return yuAlert(`🧸 ${add.length}組の動物をおぼえたよ。もう一回「書き出す」を押してね`)}
      const ev=[];rows.forEach(r=>{ev.push({d:r.d,t:r.title});if(r.emoji)ev.push({d:r.d,t:r.emoji})});
      const go=a.querySelector(".go"),hd=a.querySelector(".msg"),fc=a.querySelector(".hd img");
      if(typeof window.ttGas!=="function"){yuAlert("⚠️ 開きなおしてもう一回やってみてね");return}
      go.disabled=true;go.textContent="📡 送ってるよ…";
      try{const j=await window.ttGas(cur,ev);
        if(fc)fc.src="face-yay.webp";
        hd.innerHTML=`${+cur.slice(5)}月の予定をGoogleカレンダーに入れたよ！🌳（${j.n}件）<br><small>つぎはTimeTreeで「外部カレンダーの予定をインポート」→「ゆめいろシフト」を選んでね。同じ月を送り直しても、Googleのほうはだぶらないよ</small>`;
        go.textContent="✅ 送ったよ"}
      catch(e){go.disabled=false;go.textContent="🌳 TimeTreeへ送る";if(fc)fc.src="face-oops.webp";
        const m=String(e&&e.message||e);
        hd.innerHTML=m==="noconn"?"ごめんね、まだGASとつながってないみたい💦<br><small>⚙️設定の「🏠 おうちの温度」のURLとパスワードを入れてね</small>"
          :`ごめんね、送れなかったよ…💦<br><small>${esc(m.slice(0,100))}${/許可|権限|authoriz|permission/i.test(m)?"<br>GASをデプロイし直して、カレンダーの許可をしてね":""}</small>`}}};
  draw()}

function addBtn(){const st=document.getElementById("csvStatus");if(!st||document.getElementById("ttOut"))return;
  const b=document.createElement("button");b.id="ttOut";b.type="button";b.className="btn2 sub";
  b.style.cssText="font-family:inherit;cursor:pointer;font-size:12px;margin-top:6px";b.textContent="🌳 TimeTreeへ送る（動物の絵文字つき）";
  b.onclick=()=>ttFlow();st.parentNode.insertBefore(b,st.nextSibling)}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",addBtn);else addBtn();
})();
