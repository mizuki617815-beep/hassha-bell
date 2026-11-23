// ゆめいろ手帳：📷 シフト表のスクショ → シフト読み込み ＆ 📅 iPhoneカレンダーへ書き出し（2026-11-23）
// スクショはこのiPhoneで小さくしてから、GAS経由でGeminiに読ませる（GASは読んだら画像を捨てる）。
// 読んだ結果は確認画面で直してから、いつものシフトCSVと同じ道（date,title）で取り込む。
(function(){
const W="日月火水木金土",pad=n=>String(n).padStart(2,"0");
const esc=t=>String(t).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const md=d=>{const[y,m,dd]=d.split("-").map(Number);return`${m}/${dd}(${W[new Date(y,m-1,dd).getDay()]})`};
const nc=v=>String(v||"").replace(":","");

// ---- 画像を小さくする（長い辺2000px・JPEG）----
async function shrink(file){
  let img;try{img=await createImageBitmap(file)}catch(e){img=await new Promise((ok,ng)=>{const i=new Image();i.onload=()=>ok(i);i.onerror=()=>ng(new Error("画像が開けなかったよ"));i.src=URL.createObjectURL(file)})}
  const w=img.width,h=img.height,r=Math.min(1,1400/w,2400/h),c=document.createElement("canvas");
  c.width=Math.round(w*r);c.height=Math.round(h*r);const x=c.getContext("2d");x.fillStyle="#fff";x.fillRect(0,0,c.width,c.height);x.drawImage(img,0,0,c.width,c.height);
  return c.toDataURL("image/jpeg",0.88).split(",")[1]}

// ---- Geminiの答え → 手帳のシフトの書き方 ----
function toTitle(x){
  if(x.k==="work"&&x.s&&x.e)return`CX ${nc(x.s)}-${nc(x.e)}`;
  if(x.k==="off")return"公休日（お休み）";
  if(x.k==="leave")return"有休（お休み）";
  const t=String(x.x||"とくべつ").trim();
  return x.s&&x.e?`${t} ${nc(x.s)}-${nc(x.e)}`:`${t}（お休み）`}

// ---- 確認画面 ----
function css(){if(document.getElementById("siCss"))return;const st=document.createElement("style");st.id="siCss";st.textContent=`
#siBox{position:fixed;inset:0;z-index:10001;background:rgba(60,40,80,.32);display:flex;align-items:center;justify-content:center;padding:14px}
#siBox .cf{width:100%;max-width:380px;max-height:86vh;display:flex;flex-direction:column;background:#fff;border-radius:22px;border:2px solid var(--pink2);box-shadow:0 10px 30px rgba(183,156,255,.4);padding:14px 12px 12px}
#siBox .hd{display:flex;gap:10px;align-items:center;font-size:13.5px;font-weight:700;line-height:1.5;color:var(--ink);margin-bottom:8px}
#siBox .hd img{width:46px;height:46px;border-radius:50%;border:3px solid var(--pink);object-fit:cover;flex:none}
#siBox .ls{overflow:auto;flex:1;border-top:1px dashed #e3d6ff;border-bottom:1px dashed #e3d6ff;padding:4px 0}
#siBox .r{display:flex;align-items:center;gap:8px;padding:3px 2px}
#siBox .r b{width:64px;flex:none;font-size:13px;color:var(--ink)}
#siBox .r input{flex:1;min-width:0;font:inherit;font-size:14px;padding:6px 8px;border:1.5px solid #e3d6ff;border-radius:10px;background:#fff;color:var(--ink)}
#siBox .r.off input{color:var(--sub)}
#siBox .r .x{border:0;background:none;font-size:16px;cursor:pointer;padding:2px 4px}
#siBox .nt{font-size:11.5px;color:var(--sub);margin:6px 2px}
#siBox .b{display:flex;gap:10px;margin-top:8px}
#siBox .b button{flex:1;padding:11px 6px;border:0;border-radius:99px;font:inherit;font-weight:800;font-size:14px;cursor:pointer}
#siBox .no{background:var(--lav2);color:var(--ink)}#siBox .yes{background:linear-gradient(90deg,var(--lav),var(--pink));color:#fff}
body.dark #siBox .cf{background:#2e2747;border-color:#5a3a5c}body.dark #siBox .r input{background:#241e38;border-color:#4a3d6b}body.dark #siBox .no{background:rgba(255,255,255,.12)}`;document.head.appendChild(st)}

function confirmRows(rows){return new Promise(res=>{css();const a=document.createElement("div");a.id="siBox";
  a.innerHTML=`<div class="cf"><div class="hd"><img src="face-guide.webp" alt=""><div>スクショから${rows.length}日分読んだよ！<br>まちがいがないか見てね（直せるよ）</div></div>
  <div class="ls">${rows.map((r,i)=>`<div class="r${/お休み/.test(r.t)?" off":""}" data-i="${i}"><b>${md(r.d)}</b><input value="${esc(r.t)}" aria-label="${md(r.d)}のシフト"><button class="x" type="button" aria-label="この日を読み込まない">✕</button></div>`).join("")}</div>
  <div class="nt">出勤は「CX 0620-1645」の形、休みは「（お休み）」がついてるよ。✕でその日は読み込まないよ</div>
  <div class="b"><button type="button" class="no">やめる</button><button type="button" class="yes">読み込む</button></div></div>`;
  document.body.appendChild(a);
  a.querySelectorAll(".x").forEach(b=>b.onclick=()=>b.parentNode.remove());
  const end=v=>{a.remove();res(v)};
  a.querySelector(".no").onclick=()=>end(null);
  a.querySelector(".yes").onclick=()=>end([...a.querySelectorAll(".r")].map(el=>({d:rows[+el.dataset.i].d,t:el.querySelector("input").value.trim()})).filter(r=>r.t))})}

// ---- いつものシフトCSVの道で取り込む ----
function feed(rows){const q=v=>/[",\n]/.test(v)?`"${v.replace(/"/g,'""')}"`:v;
  const csv="date,title\n"+rows.map(r=>`${r.d},${q(r.t)}`).join("\n")+"\n";
  const kt=document.getElementById("ktCsvIn");if(!kt)throw new Error("勤怠ノートが見つからなかったよ");
  const dt=new DataTransfer();dt.items.add(new File([csv],"shift-from-screenshot.csv",{type:"text/csv"}));kt.files=dt.files;window.__siImport=true;kt.dispatchEvent(new Event("change"))}

let busy=false;
window.shiftImgFlow=async file=>{if(busy)return;busy=true;
  try{yuAlert("🧸 スクショを読んでるよ…30秒くらい待ってね");
    const b64=await shrink(file);
    let days;try{days=await window.fmShiftImg(b64,"image/jpeg")}
    catch(e){const m=String(e&&e.message||e);yuAlert(/noconn/.test(m)?"⚠️ スクショを読むには、⚙️設定の「おうちの温度」のURLとエアコンのパスワードが必要だよ":"⚠️ スクショが読めなかったよ…"+m.slice(0,80));return}
    const by={};for(const x of days)by[x.d]=toTitle(x);
    const rows=Object.keys(by).sort().map(d=>({d,t:by[d]}));
    if(!rows.length){yuAlert("⚠️ シフトが見つからなかったよ。シフト表のスクショか確認してね");return}
    const ok=await confirmRows(rows);if(!ok||!ok.length)return;
    feed(ok);
  }catch(e){yuAlert("⚠️ うまくいかなかったよ…"+String(e&&e.message||e).slice(0,80))}
  finally{busy=false}};

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
