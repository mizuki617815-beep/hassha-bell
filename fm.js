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
  ["📷","シフトのスクショからCSVを作る","プラネットのスクショをこのiPhoneの中だけで読んで、TimeTreeと同じ形のCSVに（手帳にはまだ入れない）","スクショ スクリーンショット 写真 画像 プラネット シフト表 読み込み","#impBtn"],
  ["🌳","TimeTree用に書き出す","シフトと動物の絵文字をTimeTreeへ","タイムツリー timetree 動物 絵文字 カレンダー 予定 書き出し 共有 インポート","#ttOut"],
  ["📥","ファイルを読み込む","シフト・タイムシート・明細PDF","インポート シフト タイムシート PDF CSV 取り込み 取込 読み込み 入れる","#impBtn"],
  ["🗓","読み込んだシフトを見る・消す","シフトの削除・復元","シフト 削除 復元 控え",".impShift"],
  ["📤","CSV・PDFで保存","勤怠表を書き出す","出力 エクスポート 印刷","#ktCsvOut"],
  ["🔢","この月の公休日数","ふだん10日・2月は9日","公休 休日数","#ktKoukyu"],
  ["🗑","勤怠の記録をリセット","読み込み直したいとき","リセット 削除","#ktReset"],
  ["🏖️","有休カウンター","消える分の残り日数とペース","有休 有給 年休","#paidInfo"],
  ["💪","残業がんばりカウンター","残業時間・残業代・単価の推移","残業 グラフ 単価 時給","#otInfo"]]],
 ["🧳 おでかけ",[
  ["🉐","お得チェッカー","ベネ・JAFの地図で近くの優待","優待 割引 ベネ ベネフィット JAF お得 外食","#navOtoku"],
  ["🎛","おうちのリモコン","エアコン・ライト・こたつを外から","リモコン エアコン ライト 電気 こたつ 家電 消し忘れ","#rcFold"],
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
const esc=t=>String(t).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
let LOG=[];const CHAT=-9;
function drawChips(){chips.innerHTML=(LOG.length?`<button data-g="${CHAT}">💬 会話</button>`:"")+`<button data-g="-1">ぜんぶ</button>`+FM.map((g,i)=>`<button data-g="${i}">${g[0]}</button>`).join("");
  [...chips.children].forEach(c=>c.classList.toggle("on",+c.dataset.g===grp))}
drawChips();
chips.onclick=e=>{const b=e.target.closest("button");if(!b)return;grp=+b.dataset.g;q.value="";drawChips();draw()};
// ===== 🧸 ファーちゃんに聞く（AIなし・手帳の中だけ）：読み・同じ意味のことば・点数で考えて、使い方と今のようすを答える（2026-11-23）=====
const HELP=window.FM_HELP||{},SYN=(window.FM_SYN||[]).map(g=>[...new Set(g.map(norm))]);
const STOP=/(どこ|どれ|どうやって|どうすれば|どうしたら|どうやる|どうする|やったっけ|だっけ|っけ|みたい|見たい|知りたい|しりたい|おしえて|教えて|かな|したい|って|ってなに|って何|使い方|つかいかた|やり方|やりかた|方法|ほうほう|ください|下さい|ほしい|欲しい|ちょうだい|お願い|おねがい|ファーちゃん|ふぁーちゃん|[?？!！。、,・]|です|ます|ある|あった|なに|何)/g;
const ITEMS=[];FM.forEach((g,gi)=>g[1].forEach((it,ii)=>{const hp=HELP[it[1]]||{},tk=new Set();
  (String(it[3]||"")+" "+(hp.y||"")).split(/\s+/).forEach(w=>{w=norm(w);if(w)tk.add(w)});
  String(it[1]).split(/[・／/（）()「」、 ？?→⇔]/).forEach(w=>{w=norm(w);if(w.length>=2)tk.add(w)});
  ITEMS.push({gi,ii,it,hp,tk:[...tk],nm:norm(it[1]),ds:norm(it[2]+g[0])})}));
let VOC=null;const vocab=()=>{if(VOC)return VOC;const s=new Set();ITEMS.forEach(x=>x.tk.forEach(w=>s.add(w)));SYN.forEach(g=>g.forEach(w=>s.add(w)));Object.values(YOMI).forEach(w=>s.add(norm(w)));
  VOC=[...s].filter(n=>n.length>=2||/[一-龥]/.test(n)).sort((a,b)=>b.length-a.length);return VOC};
function pick(x){const hits=[];for(const n of vocab()){if(x.includes(n)){hits.push(n);x=x.split(n).join(" ")}}return hits}
function hitsOf(t,typing){const raw=String(t).replace(STOP," ");let h=pick(norm(raw));pick(qn(raw)).forEach(n=>{if(!h.some(m=>m.includes(n)||n.includes(m)))h.push(n)});
  if(!h.length&&!typing){const x=norm(raw);// 打ちまちがい：1文字ちがいまでOK（3文字以上）
    for(const n of vocab()){if(n.length<3||/[一-龥]/.test(n))continue;for(let i=0;i+n.length<=x.length;i++){let d=0;for(let j=0;j<n.length&&d<2;j++)if(x[i+j]!==n[j])d++;if(d<=1){h.push(n);break}}if(h.length>=3)break}}
  return h}
function rank(t,typing){const hits=hitsOf(t,typing);if(!hits.length)return[];
  const terms=hits.map(h=>{const g=SYN.find(g=>g.includes(h));return g?[h,...g.filter(w=>w!==h)]:[h]});
  const out=[];ITEMS.forEach(x=>{let sc=0,all=true;
    terms.forEach(ts=>{let best=0;ts.forEach((w,k)=>{const wt=k?0.6:1;let s=0;
        if(x.tk.includes(w))s=3;else if(w.length>=2&&x.nm.includes(w))s=2.5;else if(w.length>=2&&x.tk.some(t=>t.length>=2&&(t.includes(w)||w.includes(t))))s=1.2;else if(w.length>=2&&x.ds.includes(w))s=0.8;
        best=Math.max(best,s*wt)});if(!best)all=false;sc+=best});
    if(sc>0)out.push({gi:x.gi,ii:x.ii,x,sc:sc+(all&&terms.length>1?1:0)})});
  return out.sort((a,b)=>b.sc-a.sc)}
const ask=$("fmAsk"),askT=$("fmAskT");
function say(t){if(!t){ask.classList.remove("show");return}askT.innerHTML=t;ask.classList.add("show")}
function itemBtn(gi,ii,best,cls){const it=FM[gi][1][ii];return`<button class="${cls||"fmItem"}${best?" best":""}" type="button" data-k="${gi}-${ii}"><span class="fi">${it[0]}</span><span class="ft"><b>${it[1]}${nw(it[1])}</b><small>${FM[gi][0]}・${it[2]}</small></span><span class="fa">›</span></button>`}
const HOWW=/(使い方|つかいかた|どうやって|どうやる|どうすれば|どうしたら|どうする|やり方|やりかた|入れ方|いれかた|方法|ほうほう|しかた|仕方|できる|できない|って何|ってなに|とは|わからん|わからない|教えて|おしえて|したい|たい[？?]?$)/;
const STATEW=/(ついてる|ついとる|ついてない|つけっぱ|消えてる|きえてる|消えとる|何度|なんど|いくら|何時間|なんじかん|いつ|あと何|あとなん|残り|のこり|何分|なんぷん|何日|なんにち|今月|こんげつ|きょう|今日|あした|明日|どんな|ようす|様子|状態|じょうたい|だいじょうぶ|大丈夫|晴れ|雨|寒い|さむい|暑い|あつい|傘|かさ|いる[？?]?$)/;
// 今のようすを画面から読む（iPhoneの中だけ。どこにも送らない）
// よく聞かれる数字は、画面の文からぬき出してひとことで答える（読むだけ・iPhoneの中だけ）
const SUMM={
 "#paidInfo":s=>{const m=s.match(/あと\s*(\d+(?:\.\d+)?)\s*日/);return m?`今年度に消える有休は<b>あと${m[1]}日</b>だよ🏖️`:""},
 "#ktSum":s=>{const m=s.match(/残業\s*見込み[^0-9]*?(\d+時間(?:\d+分)?)[^¥]*¥\s*([\d,]+)/);return m?`今月の残業の見込みは<b>${m[1]}・¥${m[2]}</b>だよ（勤怠ノートの記録から）`:""},
 "#homeEnv":s=>{const t=s.match(/(-?\d+(?:\.\d)?)\s*℃/),h=s.match(/(\d+(?:\.\d)?)\s*%/);return t?`おうちは<b>${t[1]}℃</b>${h?`・湿度<b>${h[1]}%</b>`:""}だよ🏠`:""}
};
function liveOf(x,t){const sel=x.hp.live;if(!sel)return"";
  if(sel==="#rcEnv"||/でんき|電気|らいと|ライト|あかり|明かり|照明/.test(t)){const sw=document.querySelector("#rcEnv .sw")||document.querySelector("#homeEnv .sw");
    if(/らいと|ライト|でんき|電気|あかり|明かり|照明|つい|消え|きえ/.test(t))return !sw?"ライトのようすは、⚙️設定で「おうちの温度」をつなぐと見られるよ":sw.classList.contains("on")?"ライトは<b>ついてる</b>みたいだよ💡（明るさで見てるよ）":sw.classList.contains("na")?"ライトのようすはわからなかったよ":"ライトは<b>消えてる</b>みたいだよ🌙（明るさで見てるよ）"}
  const el=document.querySelector(sel);if(!el)return"";let s=(el.innerText||el.textContent||"").replace(/\s+/g," ").trim();if(!s)return"";
  {const sm=SUMM[sel]&&SUMM[sel](s);if(sm)return sm}
  if(s.length>130)s=s.slice(0,130)+"…";return"いま見たら：<b>"+esc(s)+"</b>"}
let LAST=null;
function answerItem(x,t){LAST=x;const it=x.it,isState=STATEW.test(t),isHow=HOWW.test(t),where=/どこ/.test(t);let h="";
  const lv=(isState||!isHow)?liveOf(x,t):"";if(lv)h+=lv+"<br>";
  if(!(lv&&isState&&!isHow&&!where))h+=esc(x.hp.h||`「${it[1]}」は ${FM[x.gi][0]} の中にあるよ（${it[2]}）`);
  else h+=`<small>くわしくは「${esc(it[1])}」で見てね</small>`;
  const canGo=it[4]||it[5];
  return h+`<div class="fmActs">${canGo?`<button class="fmGoBtn" type="button" data-k="${x.gi}-${x.ii}">📍 そこへ連れていって</button>`:""}${x.hp.h?"":""}</div>`}
const SUG=["でんき消えてる？","でんき消して","残業代いくら？","有給あと何日","シフトの読み込み方","明細の入れ方","へや何度？","わからなかった質問"];
const sugBtns=a=>`<div class="fmActs">${a.map(s=>`<button class="fmSug" type="button">${esc(s)}</button>`).join("")}</div>`;
const MK="yumebell_fm_miss",missGet=()=>{try{return JSON.parse(localStorage.getItem(MK)||"[]")}catch(e){return[]}},missAdd=t=>{try{const m=missGet().filter(x=>x!==t);m.push(String(t).slice(0,60));localStorage.setItem(MK,JSON.stringify(m.slice(-30)))}catch(e){}};
const ACS=[[/(ほあんきゅう|保安球|じょうやとう|常夜灯|まめでんきゅう|豆電球)/,"light_night","ライトを保安球にする"],
 [/(でんき|電気|らいと|ライト|あかり|明かり|照明).*(けし|消し|けす|消す|けせ|消せ|おふ|off)/,"light_off","ライトをけす"],
 [/(でんき|電気|らいと|ライト|あかり|明かり|照明).*(つけ|点け|おん|on)/,"light_on","ライトをつける"],
 [/(れいぼう|冷房|くーらー|クーラー).*(つけ|いれ|入れ|おん)|^(れいぼう|冷房)$/,"cool","冷房をつける"],
 [/(だんぼう|暖房).*(つけ|いれ|入れ|おん)|^(だんぼう|暖房)$/,"heat","暖房をつける"],
 [/(えあこん|エアコン|れいぼう|冷房|だんぼう|暖房|くーらー).*(けし|消し|けす|消す|とめ|止め|おふ)/,"off","エアコンをけす"],
 [/こたつ.*(けし|消し|けす|消す|おふ|とめ|止め)/,"kotatsu_off","こたつをけす"]];
function acOf(n){if(/こたつ.*(つけ|いれ|入れ|おん)/.test(n))return"こたつは「けす」だけできるよ🧸（つけるのはアレクサかな）";
  if(/(えあこん|エアコン).*(つけ|いれ|入れ|おん)/.test(n)&&!/(れいぼう|冷房|だんぼう|暖房)/.test(n))return`冷房と暖房、どっちにする？🧸<div class="fmActs"><button class="fmAct" type="button" data-ac="cool">❄️ 冷房をつける</button><button class="fmAct" type="button" data-ac="heat">🔥 暖房をつける</button></div>`;
  for(const[re,cmd,lbl]of ACS)if(re.test(n))return`「${lbl}」でいい？下のボタンを押したら、いつもの確認が出るよ🧸<div class="fmActs"><button class="fmAct" type="button" data-ac="${cmd}">🎛 ${lbl}</button></div>`;return""}
// 💬 おしゃべり（あいさつ・気持ち・雑談）：時間帯で返事を変える。手帳の質問っぽい言葉が入っていたら手帳のほうを優先（2026-11-23）
const R1=a=>a[Math.floor(Math.random()*a.length)];
function chatOf(n){const h=new Date().getHours(),late=h<4,morn=h>=4&&h<10,day=h>=10&&h<18;
  const tb=/(何日|なんにち|あと|まで|いつ|設定|せってい|入れ|いれ|読み|よみ|けし|消し|つけ|点け)/.test(n);
  if(/^(おはよ|おっは|ぐっどもーにんぐ|good ?morning)/.test(n))return late?R1(["おはよう…ってママ、まだ夜中だよ！？🌙 ちゃんと寝てる？","まだお月さま出てるよ🌙 早起きさんなのか、夜ふかしさんなのか…どっち？"]):morn?R1(["おはよう、ママ☀️ きょうも一緒にがんばろうね🧸","おはよう！朝ごはん食べた？🍞🧸"]):R1(["おはよう…？もう"+h+"時だよ〜😆 ねぼすけママ🧸","おはよう！ゆっくり起きられたならよかった🧸"]);
  if(/^(こんにちは|こんにちわ|やあ|はろー|hello|hi\b|もしもし|おーい|やっほ)/.test(n))return late?"こんな時間にどうしたの？ねむれない？🌙🧸":R1(["こんにちは、ママ！なにか聞きたいことある？🧸","やっほー！手帳のことならなんでも聞いてね🧸"]);
  if(/^(こんばんは|こんばんわ)/.test(n))return R1(["こんばんは、ママ🌙 きょうもおつかれさま🧸","こんばんは！きょうはどんな一日だった？🧸"]);
  if(/^(おやすみ|ねるね|寝るね|もうねる|もう寝る|ねます|寝ます)/.test(n)&&!tb)return R1(["おやすみ、ママ🌙 あったかくして寝てね🧸","おやすみなさい💤 いい夢みてね。わたしもとなりで寝るね🧸","おやすみ🌙 あしたの準備は手帳にまかせてね🧸"]);
  if(/(ただいま)/.test(n))return R1(["おかえり、ママ！きょうもおつかれさま🧸","おかえりなさい〜！待ってたよ🧸💕"]);
  if(/(いってきます|行ってきます|いってくる|行ってくる)/.test(n))return R1(["いってらっしゃい！気をつけてね🧸","いってらっしゃい、ママ！わたしもカバンに入れてってね🧸"]);
  if(/(おつかれ|お疲れ|つかれた|疲れた|しんどい|だるい|へとへと)/.test(n))return R1(["おつかれさま、ママ…ほんとにがんばったね🧸 あったかいの飲んでゆっくりしよ","きょうもえらかったよ🧸 はちみつでもなめて休もうね🍯","よしよし…🧸 がんばりすぎないでね"]);
  if(/(ねむい|眠い|ねむたい|眠たい|ねれない|寝れない|ねむれない|眠れない)/.test(n))return late?R1(["ねむれないの？🌙 わたしがとなりにいるから、目をつぶってみよ🧸","夜中はいろいろ考えちゃうよね。深呼吸して、ゆっくりね🧸"]):R1(["ねむいね〜💤 ちょっとだけ目を休めよっか🧸","むりしないでね。おふとん恋しいね🧸"]);
  if(/(さみしい|寂しい|かなしい|悲しい|つらい|辛い|いやだ|やだ)/.test(n))return R1(["ぎゅーってしてあげる🧸 ママはひとりじゃないよ","そっか…わたしはいつでもここにいるからね🧸","よしよし。きょうはもう、がんばらなくていいよ🧸"]);
  if(/(すき|好き|だいすき|大好き|かわいい|可愛い)/.test(n)&&!tb)return R1(["えへへ…わたしもママがだいすき🧸💕","てれちゃう〜🧸💕 ありがとう！"]);
  if(/(ありがと|さんきゅ|たすかった|助かった|さすが|えらい|すごい)/.test(n))return R1(["どういたしまして！またいつでも聞いてね🧸","えへへ、役に立ててうれしい🧸","いつでもまかせてね🧸"]);
  if(/(ざつだん|雑談|おしゃべり|はなそ|話そ|ひま|暇|たいくつ|退屈)/.test(n))return R1(["いいよ〜！おしゃべりしよ🧸 わたしはね、甘いものの話がすき🥞 ママはきょうなに食べた？","おしゃべりしよ🧸 いまパンケーキ食べたい気分なんだ〜🥞","うん！カラオケ行きたいな〜🎤🧸 ママはさいきん何歌った？"])+`<br><small>（むずかしいおしゃべりはまだ練習中だよ）</small>`;
  if(/(なにしてる|何してる|げんき|元気)/.test(n))return R1(["わたしは手帳の番をしてるよ🧸 ママは元気？","元気だよ〜！ママは？🧸"]);
  if(/(おなかすいた|お腹すいた|はらへった|腹減った)/.test(n))return R1(["わたしもー！パンケーキ食べたいな🥞🧸","なに食べる？はちみつたっぷりのがいいな🍯🧸"]);
  if(/^(うん|そう|そうだね|そうなんだ|へー|へぇ|なるほど|ふーん|おけ|おっけ|ok|りょ|はーい|はい)[！!。.]*$/.test(n))return R1(["うんうん🧸","えへへ🧸 ほかに聞きたいことある？"]);
  if(/(パンケーキ|ぱんけーき|ケーキ|けーき|チョコ|ちょこ|はちみつ|ハチミツ|甘いもの|あまいもの|カラオケ|からおけ|うた|歌)/.test(n)&&!tb)return R1(["わ〜い、それだいすき🧸💕 いっしょに行こうね！","いいなぁ〜🧸 わたしも連れてってね！"]);
  return""}
function think(t){const n=norm(t);
  {const c=chatOf(n);if(c)return c}
  // 🗓 日付・時刻
  if(/(いまなんじ|今何時|いま何時|なんじ[？?]?$|何時[？?]?$)/.test(n)&&!/でる|出る|でんしゃ|電車/.test(n)){const d=new Date();return`いまは<b>${d.getHours()}時${d.getMinutes()}分</b>だよ🕐`}
  if(/(きょうなんにち|今日何日|きょう何日|なんようび|何曜日)/.test(n)){const d=new Date();return`きょうは<b>${d.getMonth()+1}月${d.getDate()}日（${"日月火水木金土"[d.getDay()]}）</b>だよ📅`}
  // 🗒 わからなかった質問
  if(/(わからなかった質問|わからんかった質問|わからなかったしつもん)/.test(n)){const m=missGet();return m.length?"わからなかった質問だよ（このiPhoneの中だけに残してるよ）👇<br>"+m.slice(-15).reverse().map(x=>"・"+esc(x)).join("<br>")+`<div class="fmActs"><button class="fmMissClr" type="button">🗑 けす</button></div>`:"わからなかった質問はまだないよ🧸"}
  // 🎛 家電：「でんき消して」→ リモコンのボタンを押す（押したらいつもの確認が出る）
  {const ac=acOf(n);if(ac)return ac}
  // 💬 さっきの話のつづき
  if(LAST&&/^(そこ|それ|そっち|あれ)?(に|へ|まで)?(つれて|連れて|いって|行って|とんで|飛んで|あんない|案内)/.test(n)){setTimeout(()=>go(LAST.gi,LAST.ii),400);return`「${esc(LAST.it[1])}」へ連れていくね🧸`}
  if(LAST&&/^(それ|そこ|あれ)?(の|って|は)?(つかいかた|使い方|どうやって|どうやる|やりかた|やり方|くわしく|詳しく|もっと)/.test(n)&&!rank(t).length)return answerItem(LAST,"使い方");
  const r=rank(t);
  if(!r.length)missAdd(t);
  if(!r.length||/(なにができる|何ができる|なにきける|何聞ける|へるぷ|help)/.test(n)&&r.length===0){
    if(/(なにができる|何ができる|なにきける|何聞ける|へるぷ|help)/.test(n))return"天気・占い・電車・あした・おしごと（勤怠・記録室）・おでかけ（お得・リモコン）・設定のことを答えられるよ。使い方も、いまのようすも聞いてね🧸"+sugBtns(SUG);
    return"ごめんね、わからなかったよ…🧸 ちがう言い方で聞いてみてね。たとえばこんなふうに👇"+sugBtns(SUG)}
  const top=r[0],second=r[1];
  if(!second||top.sc>=second.sc*1.3)return answerItem(top.x,t);
  const c=r.filter(x=>x.sc>=top.sc*0.6).slice(0,5);
  return"どれのことかな？えらんでね🧸"+`<div class="fmCands">${c.map(x=>itemBtn(x.gi,x.ii,false,"fmItem fmPick")).join("")}</div>`}
// 🧸 返事の中身でファーちゃんの顔を変える（2026-11-23）：わからない=oops・えらんで/確認=ask・けす確認=really・あいさつ/お礼/できた=yay・連れていく/使い方=guide・それ以外=talk
function faceOf(h){h=String(h);
  if(/わからなかったよ|ごめんね|つながってないみたい/.test(h))return"oops";
  if(/data-ac="[^"]*(off|kesu|stop)|けす」でいい|消す」でいい/.test(h))return"really";
  if(/どれのことかな|どっちにする|でいい？/.test(h))return"ask";
  if(/こんにちは|どういたしまして|けしたよ|おはよう、|おかえり|いってらっしゃい|だいすき|わ〜い|えへへ|やっほ/.test(h))return"yay";
  if(/まだ夜中|ねむれない|ぎゅー|よしよし|そっか…/.test(h))return"really";
  if(/みたいだよ|いまは<b>|きょうは<b>/.test(h))return"talk";
  if(/連れていくね|fmGoBtn|使い方|つかいかた/.test(h))return"guide";
  return"talk"}
const TAG={sec:"📋 秘書モード",fur:"🧸 ファーちゃんモード"};
const botHtml=(html,m,face)=>`<div class="fmMsg bot"><img class="fb" src="face-${face||faceOf(html)}.webp" alt=""><div class="fw"><div class="fs">${html}</div><div class="fmTag">${TAG[m||"sec"]}</div></div></div>`;
function push(who,html,m){LOG.push(who==="me"?`<div class="fmMsg me"><span>${esc(html)}</span></div>`:botHtml(html,m));if(LOG.length>60)LOG=LOG.slice(-60);return LOG.length-1}
// ===== 📋秘書モード（辞書）／🧸ファーちゃんモード（Gemini）の切り替え（2026-11-23）=====
// ファーちゃんモードは、打った文章とその前の会話（文字だけ・最大8件）だけをGASへ送る。手帳の数字（残業・明細・シフト・温度など）は送らない。家電のボタンはさわらせない
const MDK="yumebell_fm_mode";let MODE=(()=>{try{return localStorage.getItem(MDK)==="fur"?"fur":"sec"}catch(e){return"sec"}})();
let HIST=[];
function setMode(m){MODE=m==="fur"?"fur":"sec";try{localStorage.setItem(MDK,MODE)}catch(e){}
  const mb=$("fmMode");if(mb)[...mb.querySelectorAll("button")].forEach(b=>b.classList.toggle("on",b.dataset.m===MODE));
  q.placeholder=MODE==="fur"?"ファーちゃんとおしゃべりしよ":"ファーちゃんに聞いてね";sh.classList.toggle("fur",MODE==="fur")}
{const mb=$("fmMode");if(mb)mb.onclick=e=>{const b=e.target.closest("button[data-m]");if(!b)return;setMode(b.dataset.m);if(!q.value.trim()&&LOG.length){grp=CHAT;drawChips()}draw()}}
const plain=h=>String(h).replace(/<br\s*\/?>/g,"\n").replace(/<[^>]+>/g,"").replace(/&lt;/g,"<").replace(/&gt;/g,">").replace(/&amp;/g,"&").trim();
async function askFur(t){push("me",t);const wid="w"+Date.now();LOG.push(botHtml(`<span class="fmDots" data-wait="${wid}">入力中<i>.</i><i>.</i><i>.</i></span>`,"fur","talk"));if(LOG.length>60)LOG=LOG.slice(-60);
  q.value="";grp=CHAT;drawChips();draw();try{q.blur()}catch(e){}
  let html,face;
  try{if(!window.fmGem)throw new Error("noconn");const txt=await window.fmGem(t.slice(0,300),HIST.slice(-8));
    HIST.push({r:"user",t:t.slice(0,300)},{r:"model",t:String(txt).slice(0,500)});HIST=HIST.slice(-8);
    html=esc(txt).replace(/\n/g,"<br>")}
  catch(e){const m=String(e&&e.message||e);const c=chatOf(norm(t));
    html=/noconn/.test(m)?"ファーちゃんモードはまだ準備中だよ…🧸<br><small>⚙️設定の「おうちの温度」のURLとエアコンのパスワード、GASの GEMINI_KEY がそろうとおしゃべりできるよ</small>"
      :(c?c+"<br>":"")+`<small>（いまうまくつながらなかったよ…${esc(m.slice(0,60))}）</small>`;face=c?null:"oops"}
  const j=LOG.findIndex(x=>x.includes(`data-wait="${wid}"`)),nh=botHtml(html,"fur",face);if(j>=0)LOG[j]=nh;else LOG.push(nh);if(sh.classList.contains("show")&&grp===CHAT&&!q.value.trim())drawChat()}
function askFM(t){t=String(t||"").trim();if(!t)return;if(MODE==="fur"){askFur(t);return}push("me",t);push("bot",think(t));q.value="";grp=CHAT;drawChips();draw();try{q.blur()}catch(e){}}
function drawChat(){say("");list.innerHTML=LOG.join("")||"";requestAnimationFrame(()=>{list.scrollTop=list.scrollHeight})}
function draw(){const v=q.value.trim();
  if(!v&&grp===CHAT&&LOG.length){drawChat();return}
  if(v&&LOG.length){// 会話があるときは会話を見せたまま：秘書モードは候補を上に小さく3つだけ、ファーちゃんモードは候補なし（2026-11-23）
    if(grp!==CHAT){grp=CHAT;drawChips()}list.innerHTML=LOG.join("");list.scrollTop=list.scrollHeight;
    if(MODE==="fur"){say("");return}
    const r=rank(v,1).slice(0,3);say(r.length?`<span class="fmMinis">${r.map(x=>`<button class="fmMini" type="button" data-k="${x.gi}-${x.ii}">${x.x.it[0]} ${esc(x.x.it[1])}</button>`).join("")}</span>`:"Enter（🧸聞く）で聞いてみてね");return}
  if(v){// 打っているあいだ：点数の高い順に候補を出す
    const r=rank(v,1).slice(0,10);say(r.length?"🔍 候補だよ。文章で聞くときは Enter（🧸聞く）でファーちゃんが答えるよ":"Enter（🧸聞く）でファーちゃんに聞いてみてね");
    if(r.length){list.innerHTML=r.map((x,i)=>itemBtn(x.gi,x.ii,i===0&&(!r[1]||x.sc>=r[1].sc*1.3))).join("");return}
    const w=norm(v);let h="";ITEMS.forEach(x=>{if((x.nm+x.ds).includes(w))h+=itemBtn(x.gi,x.ii)});list.innerHTML=h||`<div class="fmNone">Enterで聞いてみてね🧸</div>`;return}
  say(LOG.length?"":"なんでも聞いてね🧸 使い方も、いまのようすも答えるよ（例：「でんき消えてる？」「明細の入れ方」）");let h="";
  FM.forEach((g,gi)=>{if(grp>=0&&gi!==grp)return;h+=`<div class="fmGrp">${g[0]}</div>`+g[1].map((it,ii)=>itemBtn(gi,ii)).join("")});
  list.innerHTML=h}
q.addEventListener("keydown",e=>{if(e.key!=="Enter"||e.isComposing)return;e.preventDefault();askFM(q.value)});
{const sb=$("fmSend");if(sb)sb.onclick=()=>askFM(q.value)}
// 開くとき画面を1pxだけ動かして戻す：うしろをスクロールしたら直った＝画面のズレのリセット（2026-11-23）
function openFM(){try{const y=window.scrollY;window.scrollTo(0,y>0?y-1:y+1);window.scrollTo(0,y)}catch(e){}sh.classList.add("show");q.value="";grp=LOG.length?CHAT:-1;drawChips();draw();if(grp!==CHAT)list.scrollTop=0;document.body.style.overflow="hidden"}
// 閉じる前にキーボード（入力欄のフォーカス）を外す：iPhoneは、フォーカスしたまま隠すと次に開いたとき入力できなくなる（2026-11-23）
function closeFM(){try{q.blur();if(document.activeElement&&sh.contains(document.activeElement))document.activeElement.blur()}catch(e){}sh.classList.remove("show");document.body.style.overflow=""}
function glow(el){el.classList.remove("fmGlow");void el.offsetWidth;el.classList.add("fmGlow");setTimeout(()=>el.classList.remove("fmGlow"),3000)}
function go(gi,ii){const it=FM[gi]&&FM[gi][1][ii];if(!it)return;closeFM();
  const pre=it[5]&&document.querySelector(it[5]);if(pre)pre.click();if(it[6])return;
  let el=it[4]&&document.querySelector(it[4]);if(!el)return;
  // 中身が空・非表示なら、まわりの見えている枠を光らせる
  while(el&&el.parentElement&&!el.offsetHeight&&!el.closest("details:not([open])"))el=el.parentElement;
  for(let d=el.closest("details");d;d=d.parentElement&&d.parentElement.closest("details"))d.open=true;
  const target=(el.matches("input,select")&&el.previousElementSibling&&el.previousElementSibling.tagName==="SPAN")?el.parentElement:null;
  afterKb(()=>{el.scrollIntoView({behavior:"smooth",block:"center"});setTimeout(()=>{glow(el);if(target&&el.previousElementSibling)glow(el.previousElementSibling)},450)})}
// iPhoneは、キーボードが引っこむ途中で画面をスクロールすると画面のズレが残って、次に案内所を開いたとき文字が入らなくなる。キーボードが閉じきってからスクロールする（2026-11-23）
function afterKb(fn){const vv=window.visualViewport;if(!vv||vv.height>=window.innerHeight-2){setTimeout(fn,60);return}
  let done=0;const f=()=>{if(done)return;done=1;vv.removeEventListener("resize",r);setTimeout(fn,120)},r=()=>{if(vv.height>=window.innerHeight-2)f()};
  vv.addEventListener("resize",r);setTimeout(f,900)}
list.onclick=e=>{const ab=e.target.closest(".fmAct");if(ab){const real=document.querySelector(`#acBtns button[data-ac="${ab.dataset.ac}"],#ltBtns button[data-ac="${ab.dataset.ac}"],#ktBtns button[data-ac="${ab.dataset.ac}"]`);
    if(!real||real.parentElement.style.display==="none"){push("bot","まだリモコンがつながってないみたい…🧸 ⚙️設定で「おうちの温度」のURLとエアコンのパスワードを入れてね");drawChat();return}
    real.click();return}
  if(e.target.closest(".fmMissClr")){try{localStorage.removeItem(MK)}catch(x){}push("bot","けしたよ🧸");drawChat();return}
  const sg=e.target.closest(".fmSug");if(sg){askFM(sg.textContent);return}
  const pk=e.target.closest(".fmPick");if(pk){const[g,i]=pk.dataset.k.split("-"),x=ITEMS.find(x=>x.gi===+g&&x.ii===+i);if(x){push("me",x.it[1]);push("bot",answerItem(x,""));grp=CHAT;drawChips();draw()}return}
  const b=e.target.closest(".fmGoBtn,.fmItem");if(b){const[g,i]=b.dataset.k.split("-");go(+g,+i)}};
ask.onclick=e=>{const b=e.target.closest(".fmMini");if(!b)return;const[g,i]=b.dataset.k.split("-"),x=ITEMS.find(x=>x.gi===+g&&x.ii===+i);if(x){q.value="";push("me",x.it[1]);push("bot",answerItem(x,""));grp=CHAT;drawChips();draw()}};
setMode(MODE);
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
