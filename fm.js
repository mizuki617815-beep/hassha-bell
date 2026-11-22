// ゆめいろ手帳：🧸 ファーちゃんの案内所🗺️（機能マップ）。index.html から読み込む。機能を足したら FM に1行足すこと
// ===== 🧸 ファーちゃんの案内所🗺️（機能マップ）：一覧＋検索、タップでその場所へ飛んで光る =====
// sel＝飛ぶ先（閉じている<details>は自動で開く）、pre＝飛ぶ前に押すボタン、only＝押すだけ（飛ばない）
(function(){
const FM=[
 ["🌤️ 天気",[
  ["🌙","あしたの朝の天気・服装","出かける時間帯の天気とコーデのアドバイス","てんき 服 コーデ 気温 体感","#morning"],
  ["⚠️","警報・台風","大雨・強風などの警報が出たらここに","けいほう 台風 注意報","#alertBox","#navWx"],
  ["🧺","クマちゃんのひとこと・洗濯","洗濯できる？部屋干し？","せんたく 洗濯 ひとこと 吹き出し","#bubble"],
  ["📆","週間天気・過去の天気","1週間先までと、過去1週間","週間 一週間 予報","#wx"],
  ["🗺","ほかの街の天気","旅行先の天気（風速つき）","旅行 大阪 名古屋 宇都宮 京都","#ocWrap"]]],
 ["🔮 占い",[
  ["🔮","きょうのファーちゃん占い","順位・はちみつ度・ラッキー","うらない 星座 運勢 ランキング","#navFortune"],
  ["⏪","おととい・きのうの占い","切りかえボタン","過去 きのう","#fDay"],
  ["ℹ️","今日の星の動き・しくみ","占いがどう決まるか","星 しくみ","#fSky"]]],
 ["🚃 電車",[
  ["🏠","行きのカウントダウン","京急蒲田→T3、次の電車まであと何分","いき 出勤 カウントダウン 蒲田","#navTrain","#tabGo"],
  ["✈️","帰りのカウントダウン","T3→京急蒲田","かえり 退勤 帰宅","#navTrain","#tabBack"],
  ["🚶","歩きながらバー","家を出たあと見る用","徒歩 あるく","#walkBar"],
  ["🌸","間に合うかの印","🌸余裕あり／✅ちょうどいい／💨ギリギリ／🚨遅刻","遅刻 ギリギリ 余裕 おすすめ 印","#hero"],
  ["🚨","京急の運行情報（公式）","遅れ・運転見合わせのチェック","遅延 遅れ 運休 運行","#navTrain a.btn2"],
  ["📋","そのあとの電車","この先の発車一覧","時刻表 一覧 次","#nextList"]]],
 ["📅 あした",[
  ["📅","あした何時に出る？","日付と時刻を入れてしらべる","予定 明日 計画","#navPlan"],
  ["⭐","ひとつ前／おすすめ／ひとつ後","3枚のカード、タップで説明","おすすめ カード","#pRes"],
  ["🏖️","お休みまであと何日","次のお休み・連休のお知らせ","休み 連休 公休","#pCheer","#navPlan"]]],
 ["🧸 おしごと",[
  ["✏️","今日の勤務の記入","残業した日だけ終わった時刻を入れる","勤怠 きろく 入力 今日 残業","#ktTodayWrap","#navKintai"],
  ["📊","今月のまとめ","就業時間・確定残業・追加残業・残業代の見込み","残業代 見込み 合計 今月","#ktSum"],
  ["📅","今月の勤務記録","ほかの日の記録を見る・直す","一覧 カレンダー 記録","#ktDaysWrap"],
  ["📚","ファーちゃんの記録室","給料・ボーナスの明細／源泉徴収票／年度のまとめ","給料 明細 ボーナス 賞与 源泉 手取り 年度",null,"#recOpen",1],
  ["🔮","次の給料の予想","明細が出る前の手取りの見込みと答え合わせ（記録室の「みる」）","給料 予想 手取り 見込み 答え合わせ",null,"#recOpen",1],
  ["📥","ファイルを読み込む","シフト・タイムシート・明細PDF","インポート シフト タイムシート PDF CSV 取り込み 取込 読み込み 入れる","#impBtn"],
  ["🗓","読み込んだシフトを見る・消す","シフトの削除・復元","シフト 削除 復元 控え",".impShift"],
  ["📤","CSV・PDFで保存","勤怠表を書き出す","出力 エクスポート 印刷","#ktCsvOut"],
  ["🔢","この月の公休日数","ふだん10日・2月は9日","公休 休日数","#ktKoukyu"],
  ["🗑","勤怠の記録をリセット","読み込み直したいとき","リセット 削除","#ktReset"],
  ["🏖️","有休カウンター","消える分の残り日数とペース","有休 有給 年休","#paidInfo"],
  ["💪","残業がんばりカウンター","残業時間・残業代・単価の推移","残業 グラフ 単価 時給","#otInfo"]]],
 ["🧳 おでかけ",[
  ["🉐","お得チェッカー","ベネ・JAFの地図で近くの優待","優待 割引 ベネ ベネフィット JAF お得 外食","#navOtoku"],
  ["🔍","お店・施設で優待をさがす","手帳割・ベネ・JAF","手帳 美術館 映画館 検索",".srchBox"],
  ["🤖","AIに聞く","GoogleのAIモードで質問","AI 質問 検索","#askWrap"],
  ["🧳","おでかけ乗り換えガイド","よく行く駅への乗り換え","乗換 乗り換え ジョルダン 駅","#navOdekake"],
  ["🕐","日時を指定してしらべる","乗換案内を日時指定で","日時 指定",".odAt"]]],
 ["⚙️ 設定",[
  ["🚃","設定：電車のまとまり","歩く時間・余裕・到着目標・ダイヤ","電車 設定","#setTrain"],
  ["💴","設定：お金のまとまり","有休・残業の手入力、残業単価","お金 設定","#setMoney"],
  ["🎨","設定：見た目・わたしのこと","お誕生日・星座・画面の色","見た目 設定","#setLook"],
  ["🚶","家 ⇔ 京急蒲田の分数","歩く時間","徒歩 あるく 家","#sWalk"],
  ["⏳","余裕をもたせる分数","電車の余裕","バッファ","#sBuf"],
  ["🚉","T3 改札→ホーム（帰り）","帰りの歩く時間","改札 ホーム","#sT3"],
  ["🎯","シフト開始の何分前に着く","到着目標（ちょうどいいの基準）","到着 目標","#sArr"],
  ["✏️","カウンターを手で直す・残業単価","有休・残業の手入力、時給","単価 時給 手入力 修正",".manFix"],
  ["🎂","お誕生日","お誕生日の表示","誕生日 バースデー","#sBdayM"],
  ["♈","星座","占いの星座","せいざ 占い","#sSign"],
  ["🎨","画面の色","自動・ライト・ダーク","テーマ ダーク ライト 色","#sTheme"],
  ["🚃","ダイヤの手動切りかえ","特別ダイヤの日に","平日 土休日 ダイヤ","#sDia"],
  ["🏠","おうちの温度","SwitchBotハブ2の温度・湿度をつなぐ","へや 部屋 室温 湿度 スイッチボット switchbot","#homeUrl"],
  ["❄️","エアコンのパスワード","冷房・暖房のボタン、温度","エアコン 冷房 暖房 パスワード あいことば","#acKey"],
  ["☁️","スプレッドシート","バックアップ・2台で共有、今すぐそろえる","シート 同期 共有 バックアップ グーグル google",".sheetBox"],
  ["📋","シートのURLをコピー","メモに控える用","URL コピー 入れ直し","#ktUrl"],
  ["👤","記録する人の名前","シートに出る名前","名前 だれ","#ktWho"]]],
 ["📝 そのほか",[
  ["📝","アップデート履歴","いままでの変更","バージョン 更新 履歴 ver","#verHist"],
  ["ℹ️","時刻表・天気のデータについて","出典と確認日","出典 データ ダイヤ改正",".infoFold.foot"],
  ["🔄","引っぱって更新","画面をいちばん上で下に引っぱると読み込み直すよ","リロード 更新 更新ボタン","#date"]]]
];
const $=id=>document.getElementById(id),sh=$("fmSheet"),q=$("fmQ"),list=$("fmList"),chips=$("fmChips");
const norm=t=>String(t||"").toLowerCase().replace(/[ァ-ヶ]/g,c=>String.fromCharCode(c.charCodeAt(0)-96)).replace(/\s+/g,"");
const YOMI={ざんぎょう:"残業",ゆうきゅう:"有休",ゆうきゅうきゅうか:"有休",きゅうりょう:"給料",めいさい:"明細",てんき:"天気",でんしゃ:"電車",せってい:"設定",かえり:"帰り",いき:"行き",たんか:"単価",じきゅう:"時給",せいざ:"星座",たんじょうび:"誕生日",ゆうたい:"優待",のりかえ:"乗換",こうきゅう:"公休",ちこく:"遅刻",きろく:"記録",ほぞん:"保存",うらない:"占い",せんたく:"洗濯",りれき:"履歴",やすみ:"休み",きんたい:"勤怠",じこく:"時刻",よゆう:"余裕",とうちゃく:"到着",かいさつ:"改札",なまえ:"名前",しょうよ:"賞与",げんせん:"源泉",てどり:"手取り",けいほう:"警報",たいふう:"台風",しゅうかん:"週間",ふく:"服",がめん:"画面",いろ:"色",さくじょ:"削除",ちえん:"遅延",うんこう:"運行",あした:"あした",しゅっきん:"出勤"};
const qn=t=>{let x=norm(t);Object.keys(YOMI).sort((a,b)=>b.length-a.length).forEach(k=>{x=x.split(k).join(norm(YOMI[k]))});return x};
let grp=-1;const NEWN=new Set(),nw=n=>NEWN.has(n)?' <span class="fmNew">🆕</span>':"";
chips.innerHTML=`<button data-g="-1" class="on">ぜんぶ</button>`+FM.map((g,i)=>`<button data-g="${i}">${g[0]}</button>`).join("");
chips.onclick=e=>{const b=e.target.closest("button");if(!b)return;grp=+b.dataset.g;[...chips.children].forEach(c=>c.classList.toggle("on",c===b));draw()};
// ===== ファーちゃんに聞く（AIなし）：文章で聞かれたら、知ってることばを拾って点数順にならべる（2026-11-21）=====
const ASKW=/(どこ|どこに|どこで|どれ|どう(やって|すれば|したら)?|やったっけ|だっけ|っけ|みたい|見たい|知りたい|しりたい|おしえて|教えて|ある[の？?]?|かな|したい|変えたい|かえたい|入れたい|いれたい|直したい|なおしたい|見る|みる|[?？!！。])/;
const STOP=/(どこ|どれ|どう|やって|すれば|したら|やったっけ|だっけ|っけ|みたい|見たい|知りたい|しりたい|おしえて|教えて|かな|したい|って|[?？!！。、,]|ファーちゃん|ふぁーちゃん)/g;
let VOC=null;const vocab=()=>{if(VOC)return VOC;const set=new Set();
  FM.forEach(g=>g[1].forEach(it=>{String(it[3]||"").split(/\s+/).forEach(w=>w&&set.add(w));String(it[1]).split(/[・／/（）()「」、 ]/).forEach(w=>w&&w.length>=2&&set.add(w))}));
  Object.values(YOMI).forEach(w=>set.add(w));
  VOC=[...set].map(w=>[w,norm(w)]).filter(([,n])=>n.length>=2||/[一-龥]/.test(n)).sort((a,b)=>b[1].length-a[1].length);return VOC};
const isAsk=t=>ASKW.test(t)||norm(t).length>=6;
function rank(t){let x=qn(String(t).replace(STOP," "));const hits=[];
  for(const[w,n]of vocab()){if(x.includes(n)){hits.push(n);x=x.split(n).join(" ")}}
  if(!hits.length)return[];const out=[];
  FM.forEach((g,gi)=>g[1].forEach((it,ii)=>{const nm=norm(it[1]),kw=norm(it[3]),ds=norm(it[2]);let sc=0;
    for(const n of hits){if(nm.includes(n))sc+=3+n.length*.1;else if(kw.includes(n))sc+=2+n.length*.1;else if(ds.includes(n))sc+=1}
    if(sc>0)out.push({gi,ii,sc})}));
  return out.sort((a,b)=>b.sc-a.sc)}
const ask=$("fmAsk"),askT=$("fmAskT");
function say(t){if(!t){ask.classList.remove("show");return}askT.innerHTML=t;ask.classList.add("show")}
function itemBtn(gi,ii,best){const it=FM[gi][1][ii];return`<button class="fmItem${best?" best":""}" type="button" data-k="${gi}-${ii}"><span class="fi">${it[0]}</span><span class="ft"><b>${it[1]}${nw(it[1])}</b><small>${FM[gi][0]}・${it[2]}</small></span><span class="fa">›</span></button>`}
function drawAsk(){const r=rank(q.value);
  if(!r.length){say("ごめんね、わからなかったよ…🧸 ちがう言い方で聞いてみてね（例：「残業単価」「シートのURL」）");list.innerHTML="";return false}
  const top=r.filter(x=>x.sc===r[0].sc),one=top.length===1&&(r.length===1||r[1].sc<r[0].sc);
  say(one?`それなら「<b>${FM[r[0].gi][1][r[0].ii][1]}</b>」だよ！タップかEnterで連れていくね`:"どれのこと？えらんでね");
  list.innerHTML=r.slice(0,8).map((x,i)=>itemBtn(x.gi,x.ii,one&&i===0)).join("");return one?r[0]:null}
q.addEventListener("keydown",e=>{if(e.key!=="Enter"||e.isComposing)return;e.preventDefault();
  const v=q.value.trim();if(!v)return;
  if(isAsk(v)||!list.querySelector(".fmItem")){const one=drawAsk();if(one){say(`「${FM[one.gi][1][one.ii][1]}」はここだよ！🧸`);setTimeout(()=>go(one.gi,one.ii),700)}}
  else{const b=list.querySelectorAll(".fmItem");if(b.length===1)b[0].click()}});
function draw(){if(q.value.trim()&&isAsk(q.value)){drawAsk();return}say("");const w=qn(q.value).split(/[,、]/).filter(Boolean);let h="",n=0;
  FM.forEach((g,gi)=>{if(grp>=0&&gi!==grp&&!w.length)return;
    const its=g[1].map((it,ii)=>[it,ii]).filter(([it])=>!w.length||w.every(k=>norm(g[0]+it[1]+it[2]+it[3]).includes(k)));
    if(!its.length)return;n+=its.length;
    h+=`<div class="fmGrp">${g[0]}</div>`+its.map(([it,ii])=>`<button class="fmItem" type="button" data-k="${gi}-${ii}"><span class="fi">${it[0]}</span><span class="ft"><b>${it[1]}${nw(it[1])}</b><small>${it[2]}</small></span><span class="fa">›</span></button>`).join("")});
  if(!n&&q.value.trim()){drawAsk();return}
  list.innerHTML=n?h:`<div class="fmNone">見つからなかったよ🧸<br>ちがうことばでさがしてみてね</div>`}
function openFM(){sh.classList.add("show");q.value="";say("");draw();list.scrollTop=0;document.body.style.overflow="hidden"}
function closeFM(){sh.classList.remove("show");document.body.style.overflow=""}
function glow(el){el.classList.remove("fmGlow");void el.offsetWidth;el.classList.add("fmGlow");setTimeout(()=>el.classList.remove("fmGlow"),3000)}
function go(gi,ii){const it=FM[gi]&&FM[gi][1][ii];if(!it)return;closeFM();
  const pre=it[5]&&document.querySelector(it[5]);if(pre)pre.click();if(it[6])return;
  let el=it[4]&&document.querySelector(it[4]);if(!el)return;
  // 中身が空・非表示なら、まわりの見えている枠を光らせる
  while(el&&el.parentElement&&!el.offsetHeight&&!el.closest("details:not([open])"))el=el.parentElement;
  for(let d=el.closest("details");d;d=d.parentElement&&d.parentElement.closest("details"))d.open=true;
  const target=(el.matches("input,select")&&el.previousElementSibling&&el.previousElementSibling.tagName==="SPAN")?el.parentElement:null;
  setTimeout(()=>{el.scrollIntoView({behavior:"smooth",block:"center"});setTimeout(()=>{glow(el);if(target&&el.previousElementSibling)glow(el.previousElementSibling)},450)},60)}
list.onclick=e=>{const b=e.target.closest(".fmItem");if(b){const[g,i]=b.dataset.k.split("-");go(+g,+i)}};
q.oninput=draw;$("fmX").onclick=closeFM;sh.onclick=e=>{if(e.target===sh)closeFM()};
$("fmOpen").onclick=openFM;$("fmOpen2").onclick=openFM;
window.fmGo=(name)=>{let hit=0;FM.forEach((g,gi)=>g[1].forEach((it,ii)=>{if(!hit&&it[1]===name){hit=1;go(gi,ii)}}))}; // 更新履歴などから呼ぶ用
window.fmOpen=openFM;
// 💴お金の設定はふだんシートと明細から自動。まちがえていじらないようにカギつき、グループを閉じたらまたカギ（2026-11-21）
(function(){const fs=$("moneyFs"),bt=$("moneyUnlock"),g=$("setMoney");if(!fs||!bt||!g)return;
  const lock=v=>{fs.disabled=v;bt.textContent=v?"🔓 カギをあけて手で直す":"🔒 カギをかける（直しおわったら）"};
  bt.onclick=async()=>{if(fs.disabled){if(await yuAsk("ふだんはシートと明細から自動で入るよ。ほんまに手で直す？🧸","手で直す",true))lock(false)}else lock(true)};
  g.addEventListener("toggle",()=>{if(!g.open)lock(true)})})();
// ===== 更新履歴 → その機能へ飛ぶボタン＋🆕マーク（いちばん新しい更新1つだけ・3日以内）（2026-11-21）=====
(function(){const now=new Date(),FMN=new Set();FM.forEach(g=>g[1].forEach(it=>FMN.add(it[1])));
  document.querySelectorAll("#verHist li").forEach((li,idx)=>{
    const dt=((li.querySelector(".vDate")||{}).textContent||"").match(/(\d+)\/(\d+)/);let fresh=false;
    if(dt){let d=new Date(now.getFullYear(),+dt[1]-1,+dt[2]);if(d-now>864e5)d.setFullYear(d.getFullYear()-1);fresh=idx===0&&now-d<3*864e5}
    const names=(li.dataset.go||"").split("|").filter(Boolean);
    if(fresh){li.classList.add("vIsNew");const v=li.querySelector(".vNo");if(v)v.insertAdjacentHTML("afterend",'<span class="vNew">🆕</span>');names.forEach(n=>NEWN.add(n))}
    if(!names.length)return;const box=document.createElement("div");box.className="vGo";
    box.innerHTML=names.filter(n=>n==="@案内所"||FMN.has(n)).map(n=>`<button type="button" data-n="${n}">👉 ${n==="@案内所"?"案内所をひらく":n}</button>`).join("");
    box.onclick=e=>{const b=e.target.closest("button");if(!b)return;e.preventDefault();b.dataset.n==="@案内所"?openFM():window.fmGo(b.dataset.n)};
    li.appendChild(box)})})();
})();
