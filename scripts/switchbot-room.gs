/**
 * ゆめいろ手帳：おうちの温度・湿度（SwitchBot ハブ2）を見るだけのGAS
 *
 * ★トークン・シークレットはこのファイルに書かないでね。
 *   GASの「プロジェクトの設定」→「スクリプト プロパティ」に入れる：
 *     SB_TOKEN  … SwitchBotアプリのトークン
 *     SB_SECRET … SwitchBotアプリのシークレット
 *     SB_DEVICE … (なくてOK) ハブ2のデバイスID。空なら自動でさがして覚える
 *     SB_KEY    … エアコンを動かすためのパスワード（自分で決める）。アプリの設定にも同じものを入れる
 *     SB_AC     … (なくてOK) エアコンのリモコンID。空なら自動でさがして覚える
 *     GEMINI_KEY   … (ファーちゃんモード用) Google AI Studio で作ったAPIキー
 *     GEMINI_MODEL … (なくてOK) 使うモデル。空なら gemini-flash-lite-latest（いちばん軽くて無料のわくが多い）
 *
 * デプロイ：「デプロイ」→「新しいデプロイ」→ 種類「ウェブアプリ」
 *   実行ユーザー：自分 ／ アクセスできるユーザー：全員
 *   出てきた …/exec のURLを、ゆめいろ手帳の⚙️設定「🏠 おうちの温度」に貼る
 *
 * GET  … 温度・湿度・明るさ（lightLevel 1〜20）・時刻を返す（見るだけ）
 * POST … {"cmd":"cool"|"heat"|"off","temp":27,"k":"パスワード"} でエアコンを動かす
 *        {"cmd":"light_on"|"light_off","k":"パスワード"} でライト（ハブ2の赤外線。リモコンを覚えさせたもの）
 *        {"cmd":"light_night","k":"パスワード"} でライトを保安球に（SwitchBotアプリのシーン「保安球」を実行）
 *        {"cmd":"kotatsu_off","k":"パスワード"} でこたつをけす（hapicom → Alexa定型アクション）
 *        {"cmd":"chat","q":"文章","h":[{"r":"user"|"model","t":"..."}],"k":"パスワード"} でファーちゃんモード（Gemini）のおしゃべり
 *        {"cmd":"tt_cal","ym":"2026-12","ev":[{"d":"2026-12-01","t":"CX FC 0615-1515"},{"d":"2026-12-01","t":"🐇"}],"k":"パスワード"}
 *          → Googleカレンダー「ゆめいろシフト」のその月の予定を入れかえる（TimeTreeが「外部カレンダーの予定をインポート」で取り込む用）
 *          ※はじめてのときは、デプロイし直すときにカレンダーの許可を聞かれるので「許可」してね
 *        {"cmd":"tt_clear","ym":"2026-12","k":"パスワード"} → 「ゆめいろシフト」のその月の予定を全部消す（TimeTreeに取り込んだあとの片づけ用）
 *        パスワード（SB_KEY）が合わないとき・入ってないときは動かさない
 */

const SB_API = 'https://api.switch-bot.com/v1.1';

function doGet() {
  let out;
  try {
    const cache = CacheService.getScriptCache();
    const hit = cache.get('room');
    if (hit) {
      out = JSON.parse(hit);
    } else {
      const id = hubId_();
      const st = sb_('/devices/' + id + '/status');
      out = { ok: true, t: st.temperature, h: st.humidity, l: st.lightLevel, at: Date.now() }; // l=明るさ（1〜20）
      cache.put('room', JSON.stringify(out), 120); // 2分は同じ値を返して、APIを呼びすぎないように
    }
  } catch (e) {
    out = { ok: false, err: String(e && e.message || e) };
  }
  return ContentService.createTextOutput(JSON.stringify(out))
    .setMimeType(ContentService.MimeType.JSON);
}

// エアコンの操作（パスワードつき）
function doPost(e) {
  let out;
  try {
    const q = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    const key = String(PropertiesService.getScriptProperties().getProperty('SB_KEY') || '').trim();
    if (!key) throw new Error('SB_KEY（パスワード）がGASに入ってないよ');
    if (String(q.k || '').trim() !== key) throw new Error('パスワードがちがうよ');
    if (q.cmd === 'tt_clear') {
      const lk = LockService.getScriptLock();
      lk.waitLock(20000);
      try {
        return ContentService.createTextOutput(JSON.stringify(Object.assign({ ok: true }, ttClear_(q))))
          .setMimeType(ContentService.MimeType.JSON);
      } finally { lk.releaseLock(); }
    }
    if (q.cmd === 'tt_cal') {
      const lk = LockService.getScriptLock();
      lk.waitLock(20000);
      try {
        return ContentService.createTextOutput(JSON.stringify(Object.assign({ ok: true }, ttCal_(q))))
          .setMimeType(ContentService.MimeType.JSON);
      } finally { lk.releaseLock(); }
    }
    if (q.cmd === 'chat') {
      return ContentService.createTextOutput(JSON.stringify({ ok: true, text: chat_(q) }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    const lock = LockService.getScriptLock();
    lock.waitLock(10000);
    try {
      if (q.cmd === 'light_on' || q.cmd === 'light_off' || q.cmd === 'light_night' || q.cmd === 'kotatsu_off') {
        const r = q.cmd === 'kotatsu_off' ? (hcTrigger_(q.cmd), { skip: false })
          : q.cmd === 'light_night' ? lightNight_() : light_(q.cmd === 'light_on');
        out = { ok: true, cmd: q.cmd, skip: r.skip, room: r.room || null, at: Date.now() };
        return ContentService.createTextOutput(JSON.stringify(out))
          .setMimeType(ContentService.MimeType.JSON);
      }
      const id = acId_();
      const t = Math.round(Number(q.temp));
      if (q.cmd === 'off') {
        sbCmd_(id, 'turnOff', 'default');
      } else if (q.cmd === 'cool' || q.cmd === 'heat') {
        if (!(t >= 16 && t <= 30)) throw new Error('温度は16〜30℃にしてね');
        // setAll = "温度,モード,風量,電源"  モード 2=冷房 5=暖房 ／ 風量 1=自動
        sbCmd_(id, 'setAll', t + ',' + (q.cmd === 'cool' ? 2 : 5) + ',1,on');
      } else {
        throw new Error('わからない操作だよ');
      }
    } finally { lock.releaseLock(); }
    out = { ok: true, cmd: q.cmd, temp: q.temp, at: Date.now() };
  } catch (err) {
    out = { ok: false, err: String(err && err.message || err) };
  }
  return ContentService.createTextOutput(JSON.stringify(out))
    .setMimeType(ContentService.MimeType.JSON);
}

// エアコンのリモコン（ハブ2に覚えさせたもの）のIDをさがして覚えておく
function acId_() {
  const p = PropertiesService.getScriptProperties();
  const saved = p.getProperty('SB_AC');
  if (saved) return saved;
  const list = sb_('/devices').infraredRemoteList || [];
  const ac = list.find(d => d.remoteType === 'Air Conditioner') || list.find(d => /Air Conditioner/.test(d.remoteType || ''));
  if (!ac) throw new Error('エアコンのリモコンが見つからないよ');
  p.setProperty('SB_AC', ac.deviceId);
  return ac.deviceId;
}

function sbCmd_(id, command, parameter) {
  return sb_('/devices/' + id + '/commands', { command: command, parameter: parameter, commandType: 'command' });
}

// ライト：ハブ2に覚えさせた赤外線リモコン（＋スタイルのリモコンは ON/OFF が1つのボタン）
//   SB_LIGHT … (なくてOK) ライトのリモコンID。空なら自動でさがして覚える
//   SwitchBotアプリの「点灯」にリモコンの「全灯」、「消灯」にリモコンの「ON/OFF」を覚えさせてある
//   「全灯」も「ON/OFF」も、ついているときに押すと消える（どちらも切りかえ）。なので送るのは「ON/OFF」（turnOff）だけ
//   夜：ハブ2の明るさ（消えてる≒1、ついてる≒12、いちばん暗くしてもついてる≒4）で今の状態を見て、ちがうときだけ1回送る。4以上ならついてる（2026-11-23 5→4）
//   昼：日差しで状態がわからないので、1回送って約8秒後の明るさを見る。逆に動いた（けすで明るくなった等）ときはもう1回送る
//   ハブ2の明るさは、ライトが変わってから6〜8秒くらいで反映される（2026-11-22 testLightLag で確認）→ 送ったあと9秒待って読みなおし、結果をアプリに返す
function light_(on) {
  const id = lightId_(), hub = hubId_();
  const status = () => sb_('/devices/' + hub + '/status');
  const lvOf = st => st && typeof st.lightLevel === 'number' ? st.lightLevel : null;
  const toggle = () => sbCmd_(id, 'turnOff', 'default');
  const night = isNight_(new Date());
  let st0 = null;
  try { st0 = status(); } catch (e) {}
  const l0 = lvOf(st0);
  if (l0 !== null && night && on === (l0 >= 4)) return { skip: true, room: roomOf_(st0) };  // もうその状態
  toggle();
  // 明るさが反映されるのを待って読みなおす（アプリの表示もすぐ新しくなるように）
  Utilities.sleep(9000);
  let st1 = null;
  try { st1 = status(); } catch (e) {}
  const l1 = lvOf(st1);
  if (!night && l0 !== null && l1 !== null && (on ? l1 <= l0 - 3 : l1 >= l0 + 3)) {  // 昼：逆に動いたのでもう1回
    toggle();
    Utilities.sleep(9000);
    try { st1 = status(); } catch (e) {}
  }
  const room = st1 ? roomOf_(st1) : null;
  const cache = CacheService.getScriptCache();
  if (room) cache.put('room', JSON.stringify(room), 120); else cache.remove('room');
  return { skip: false, room: room };
}
// 保安球：SwitchBotアプリの「シーン」で「保安球」（ライトリモコンの「常夜灯」を押すだけ）を作っておき、それを実行する（2026-11-23）
//   覚えさせたボタンを名前で送る方法（customize）は、このリモコンでは 3005 invalid value で使えなかったのでシーン経由にした
//   SB_SCENE_NIGHT … (なくてOK) シーンID。空なら名前「保安球」でさがして覚える
//   保安球は明るさで ON/OFF を見分けにくいので、状態チェックはしない（9秒後の明るさだけアプリに返す）
const LIGHT_NIGHT_SCENE = '保安球';
function nightSceneId_() {
  const p = PropertiesService.getScriptProperties();
  const saved = p.getProperty('SB_SCENE_NIGHT');
  if (saved) return saved;
  const sc = (sb_('/scenes') || []).find(x => String(x.sceneName || '').trim() === LIGHT_NIGHT_SCENE);
  if (!sc) throw new Error('SwitchBotアプリにシーン「' + LIGHT_NIGHT_SCENE + '」が見つからないよ');
  p.setProperty('SB_SCENE_NIGHT', sc.sceneId);
  return sc.sceneId;
}
function lightNight_() {
  sb_('/scenes/' + nightSceneId_() + '/execute', {});
  Utilities.sleep(9000);
  let st1 = null;
  try { st1 = sb_('/devices/' + hubId_() + '/status'); } catch (e) {}
  const room = st1 ? roomOf_(st1) : null;
  const cache = CacheService.getScriptCache();
  if (room) cache.put('room', JSON.stringify(room), 120); else cache.remove('room');
  return { skip: false, room: room };
}
function roomOf_(st) {
  return { ok: true, t: st.temperature, h: st.humidity, l: st.lightLevel, at: Date.now() };
}
function lightId_() {
  const p = PropertiesService.getScriptProperties();
  const saved = p.getProperty('SB_LIGHT');
  if (saved) return saved;
  const list = sb_('/devices').infraredRemoteList || [];
  const lt = list.find(d => /Light/i.test(d.remoteType || ''));
  if (!lt) throw new Error('ライトのリモコンが見つからないよ');
  p.setProperty('SB_LIGHT', lt.deviceId);
  return lt.deviceId;
}
// 東京の日の出・日の入り（おおよそ）の30分前後より外なら夜
function isNight_(d) {
  const N = Math.floor((d - new Date(d.getFullYear(), 0, 0)) / 864e5), r = Math.PI / 180;
  const dec = 23.44 * Math.sin(2 * Math.PI * (284 + N) / 365) * r;
  const half = Math.acos(-Math.tan(35.6 * r) * Math.tan(dec)) / r / 15;
  const h = Number(Utilities.formatDate(d, 'Asia/Tokyo', 'H')) + Number(Utilities.formatDate(d, 'Asia/Tokyo', 'm')) / 60;
  return h < 11.7 - half - 0.5 || h > 11.7 + half + 0.5;
}

// こたつをけす：hapicom「仮想トリガーボタン」(無料の default) → Alexaの定型アクション → こたつ
//   HC_KEY         … hapicomのAPIキー（tr_…）
//   HC_KOTATSU_OFF … (なくてOK) トリガーID。空なら default
function hcTrigger_(cmd) {
  const p = PropertiesService.getScriptProperties();
  const key = String(p.getProperty('HC_KEY') || '').replace(/\s/g, '');
  if (!key) throw new Error('HC_KEY（hapicomのAPIキー）が入ってないよ');
  const trig = String(p.getProperty('HC_KOTATSU_OFF') || 'default').trim();
  const res = UrlFetchApp.fetch('https://alexa.hapicom.jp/tr/' + encodeURIComponent(trig), {
    headers: { Authorization: 'Bearer ' + key }, muteHttpExceptions: true
  });
  const code = res.getResponseCode();
  if (code < 200 || code >= 300) throw new Error('hapicom: ' + code + ' ' + res.getContentText().slice(0, 100));
}

// エディタで▶実行して確かめる用
function testLightOn() { Logger.log(light_(true).skip ? 'もうついてたので送らなかったよ' : 'ライト：つける を送ったよ'); }
function testLightOff() { Logger.log(light_(false).skip ? 'もう消えてたので送らなかったよ' : 'ライト：けす を送ったよ'); }
function testLightNight() { lightNight_(); Logger.log('ライト：保安球（常夜灯）を送ったよ'); }
function testKotatsuOff() { hcTrigger_('kotatsu_off'); Logger.log('こたつけす を送ったよ'); }
// 診断用：消灯（ON/OFF）を1回だけ送って、明るさが何秒で変わるか見る
function testLightLag() {
  const lv = () => sb_('/devices/' + hubId_() + '/status').lightLevel;
  const out = ['前: ' + lv()];
  sbCmd_(lightId_(), 'turnOff', 'default');
  for (let i = 1; i <= 5; i++) { Utilities.sleep(2000); out.push((i * 2) + '秒: ' + lv()); }
  Logger.log(out.join(' / '));
}
function testRemotes() { Logger.log(JSON.stringify(sb_('/devices').infraredRemoteList)); }
function testHubStatus() { Logger.log(JSON.stringify(sb_('/devices/' + hubId_() + '/status'))); }

// ハブ2のIDをさがして、スクリプトプロパティに覚えておく
function hubId_() {
  const p = PropertiesService.getScriptProperties();
  const saved = p.getProperty('SB_DEVICE');
  if (saved) return saved;
  const list = sb_('/devices').deviceList || [];
  const hub = list.find(d => d.deviceType === 'Hub 2');
  if (!hub) throw new Error('ハブ2が見つからないよ');
  p.setProperty('SB_DEVICE', hub.deviceId);
  return hub.deviceId;
}

// SwitchBot API v1.1 の呼び出し（署名つき）
function sb_(path, body) {
  const p = PropertiesService.getScriptProperties();
  // 貼るときに入った空白・改行は取りのぞく（入っていると Unauthorized になる）
  const token = String(p.getProperty('SB_TOKEN') || '').replace(/\s/g, ''), secret = String(p.getProperty('SB_SECRET') || '').replace(/\s/g, '');
  if (!token || !secret) throw new Error('SB_TOKEN / SB_SECRET が入ってないよ');
  const t = String(Date.now());
  const nonce = Utilities.getUuid();
  const sign = Utilities.base64Encode(
    Utilities.computeHmacSha256Signature(token + t + nonce, secret));
  const opt = {
    headers: { Authorization: token, sign: sign, nonce: nonce, t: t,
               'Content-Type': 'application/json; charset=utf8' },
    muteHttpExceptions: true
  };
  if (body) { opt.method = 'post'; opt.payload = JSON.stringify(body); }
  const res = UrlFetchApp.fetch(SB_API + path, opt);
  const j = JSON.parse(res.getContentText());
  if (j.statusCode !== 100) throw new Error('SwitchBot: ' + j.statusCode + ' ' + (j.message || ''));
  return j.body;
}

// エディタで▶実行すると、ちゃんと読めるかログで確認できるよ
function test() {
  Logger.log(doGet().getContent());
}

// エアコンのリモコンが見つかるか確認（動かしはしない）
function testAc() {
  Logger.log('エアコンのID: ' + acId_());
}

// 🧸 ファーちゃんモード：Geminiとおしゃべり（2026-11-23）
// 手帳から届くのは、打った文章と前の会話（文字だけ）だけ。家電は動かさない
const FUR_SYS = [
  'あなたは「ファーちゃん」。チェックのワンピースを着た、ふわふわのクマのぬいぐるみの女の子です。',
  '話し相手は持ち主の女性で、あなたは彼女を「ママ」と呼びます。ママの分身のような存在で、ママを励ましたり癒やしたりします。',
  '甘いもの（パンケーキ・ケーキ・チョコ・はちみつ・ヨーグレット）と歌が好き。ママとよく旅行に一緒に行きます。',
  'やさしい話し言葉（「〜だよ」「〜だね」）で、2〜3文くらいの短い返事にして、ときどき🧸などの絵文字を使います。',
  '夫のことは「旦那」と言わず、「ふたり」などの言い方にします。',
  '手帳アプリの使い方・残業代・シフト・家電の操作を聞かれたら、自分では答えずに「上の📋秘書モードに切り替えて聞いてね」とやさしく伝えます。',
  'わからないことや最新の情報は、知ったかぶりせずに「わからないな」と正直に言います。'
].join('\n');

// 「ゆめいろシフト」カレンダーを返す（ID は TT_CAL に覚える）。make=false でなければ作らない
function ttCalendar_(make) {
  const P = PropertiesService.getScriptProperties();
  const NAME = 'ゆめいろシフト';
  let cal = null;
  const id = P.getProperty('TT_CAL');
  if (id) { try { cal = CalendarApp.getCalendarById(id); } catch (e) { cal = null; } }
  if (!cal) cal = (CalendarApp.getOwnedCalendarsByName(NAME) || [])[0] || null;
  if (!cal && make) cal = CalendarApp.createCalendar(NAME, { timeZone: 'Asia/Tokyo' });
  if (cal) P.setProperty('TT_CAL', cal.getId());
  return cal;
}

// 🧹 TimeTreeに取り込んだあとの片づけ：「ゆめいろシフト」のその月の予定を全部消す（TimeTreeの予定は消えない）
function ttClear_(q) {
  const ym = String(q.ym || '');
  if (!/^\d{4}-\d{2}$/.test(ym)) throw new Error('月がわからないよ');
  const cal = ttCalendar_(false);
  if (!cal) return { n: 0 };
  const y = +ym.slice(0, 4), m = +ym.slice(5, 7);
  const evs = cal.getEvents(new Date(y, m - 1, 1), new Date(y, m, 1));
  evs.forEach(function (e) { e.deleteEvent(); });
  return { n: evs.length };
}

// 🌳 TimeTree用：Googleカレンダー「ゆめいろシフト」に、その月のシフトと動物を終日予定で入れる（2026-11-23）
// 同じ月を送り直したら、その月の分を消してから入れ直す（だぶらない）。ほかのカレンダーはさわらない
function ttCal_(q) {
  const ym = String(q.ym || '');
  if (!/^\d{4}-\d{2}$/.test(ym)) throw new Error('月がわからないよ');
  const ev = Array.isArray(q.ev) ? q.ev : [];
  if (!ev.length || ev.length > 200) throw new Error('予定の数がおかしいよ');
  const cal = ttCalendar_(true);
  const y = +ym.slice(0, 4), m = +ym.slice(5, 7);
  const from = new Date(y, m - 1, 1), to = new Date(y, m, 1);
  cal.getEvents(from, to).forEach(function (e) { e.deleteEvent(); });
  let n = 0;
  ev.forEach(function (x) {
    const d = String(x && x.d || ''), t = String(x && x.t || '').replace(/[\r\n]/g, ' ').trim().slice(0, 80);
    if (!t || !/^\d{4}-\d{2}-\d{2}$/.test(d) || d.slice(0, 7) !== ym) return;
    cal.createAllDayEvent(t, new Date(+d.slice(0, 4), +d.slice(5, 7) - 1, +d.slice(8, 10)));
    n++;
  });
  return { n: n, cal: 'ゆめいろシフト' };
}

function chat_(q) {
  const P = PropertiesService.getScriptProperties();
  const key = String(P.getProperty('GEMINI_KEY') || '').trim();
  if (!key) throw new Error('GEMINI_KEY がGASに入ってないよ');
  const model = String(P.getProperty('GEMINI_MODEL') || 'gemini-flash-lite-latest').trim();
  const text = String(q.q || '').slice(0, 300).trim();
  if (!text) throw new Error('文章がからっぽだよ');
  const contents = [];
  (Array.isArray(q.h) ? q.h.slice(-8) : []).forEach(m => {
    const t = String(m && m.t || '').slice(0, 500);
    if (t) contents.push({ role: m.r === 'model' ? 'model' : 'user', parts: [{ text: t }] });
  });
  contents.push({ role: 'user', parts: [{ text: text }] });
  const j = gemFetch_(key, model, { systemInstruction: { parts: [{ text: FUR_SYS }] }, contents: contents, generationConfig: { maxOutputTokens: 2048, temperature: 0.9 } });
  const c = j.candidates && j.candidates[0];
  const out = c && c.content && (c.content.parts || []).filter(p => p.text && !p.thought).map(p => p.text).join('').trim();
  if (!out) throw new Error('返事がからっぽだったよ');
  return out.slice(0, 800);
}

// Geminiに送る（共通）。混んでる（503/500）ときだけ、2秒待って同じモデルで1回だけやり直す（やり直しも無料のわくを1回使う）
function gemFetch_(key, model, body) {
  const opt = { method: 'post', contentType: 'application/json', muteHttpExceptions: true,
    headers: { 'x-goog-api-key': key }, payload: JSON.stringify(body) };
  const url = 'https://generativelanguage.googleapis.com/v1beta/models/' + encodeURIComponent(model) + ':generateContent';
  let res = UrlFetchApp.fetch(url, opt);
  let code = res.getResponseCode();
  if (code === 503 || code === 500) { Utilities.sleep(2000); res = UrlFetchApp.fetch(url, opt); code = res.getResponseCode(); }
  let j = {};
  try { j = JSON.parse(res.getContentText() || '{}'); } catch (e) {}
  if (code === 503 || code === 500) throw new Error('いまGeminiが混んでるみたい…少し待ってからまた話しかけてね🧸');
  if (code === 429) throw new Error('きょうはおしゃべりしすぎたみたい（無料のわく）。少し時間をおいてね');
  if (code !== 200) throw new Error((j.error && j.error.message || ('エラー ' + code)).slice(0, 120));
  return j;
}
