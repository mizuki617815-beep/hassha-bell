/**
 * ゆめいろ手帳：おうちの温度・湿度（SwitchBot ハブ2）を見るだけのGAS
 *
 * ★トークン・シークレットはこのファイルに書かないでね。
 *   GASの「プロジェクトの設定」→「スクリプト プロパティ」に入れる：
 *     SB_TOKEN  … SwitchBotアプリのトークン
 *     SB_SECRET … SwitchBotアプリのシークレット
 *     SB_DEVICE … (なくてOK) ハブ2のデバイスID。空なら自動でさがして覚える
 *     SB_KEY    … エアコンを動かすための合言葉（自分で決める）。アプリの設定にも同じものを入れる
 *     SB_AC     … (なくてOK) エアコンのリモコンID。空なら自動でさがして覚える
 *
 * デプロイ：「デプロイ」→「新しいデプロイ」→ 種類「ウェブアプリ」
 *   実行ユーザー：自分 ／ アクセスできるユーザー：全員
 *   出てきた …/exec のURLを、ゆめいろ手帳の⚙️設定「🏠 おうちの温度」に貼る
 *
 * GET  … 温度・湿度・時刻を返す（見るだけ）
 * POST … {"cmd":"cool"|"heat"|"off","temp":27,"k":"合言葉"} でエアコンを動かす
 *        合言葉（SB_KEY）が合わないとき・入ってないときは動かさない
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
      out = { ok: true, t: st.temperature, h: st.humidity, at: Date.now() };
      cache.put('room', JSON.stringify(out), 120); // 2分は同じ値を返して、APIを呼びすぎないように
    }
  } catch (e) {
    out = { ok: false, err: String(e && e.message || e) };
  }
  return ContentService.createTextOutput(JSON.stringify(out))
    .setMimeType(ContentService.MimeType.JSON);
}

// エアコンの操作（合言葉つき）
function doPost(e) {
  let out;
  try {
    const q = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    const key = String(PropertiesService.getScriptProperties().getProperty('SB_KEY') || '').trim();
    if (!key) throw new Error('SB_KEY（合言葉）がGASに入ってないよ');
    if (String(q.k || '').trim() !== key) throw new Error('合言葉がちがうよ');
    const lock = LockService.getScriptLock();
    lock.waitLock(10000);
    try {
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
