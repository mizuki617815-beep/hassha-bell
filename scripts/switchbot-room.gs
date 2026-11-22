/**
 * ゆめいろ手帳：おうちの温度・湿度（SwitchBot ハブ2）を見るだけのGAS
 *
 * ★トークン・シークレットはこのファイルに書かないでね。
 *   GASの「プロジェクトの設定」→「スクリプト プロパティ」に入れる：
 *     SB_TOKEN  … SwitchBotアプリのトークン
 *     SB_SECRET … SwitchBotアプリのシークレット
 *     SB_DEVICE … (なくてOK) ハブ2のデバイスID。空なら自動でさがして覚える
 *
 * デプロイ：「デプロイ」→「新しいデプロイ」→ 種類「ウェブアプリ」
 *   実行ユーザー：自分 ／ アクセスできるユーザー：全員
 *   出てきた …/exec のURLを、ゆめいろ手帳の⚙️設定「🏠 おうちの温度」に貼る
 *
 * 返すのは温度・湿度・時刻だけ。エアコンなどの操作はしない（見るだけ）。
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
function sb_(path) {
  const p = PropertiesService.getScriptProperties();
  // 貼るときに入った空白・改行は取りのぞく（入っていると Unauthorized になる）
  const token = String(p.getProperty('SB_TOKEN') || '').replace(/\s/g, ''), secret = String(p.getProperty('SB_SECRET') || '').replace(/\s/g, '');
  if (!token || !secret) throw new Error('SB_TOKEN / SB_SECRET が入ってないよ');
  const t = String(Date.now());
  const nonce = Utilities.getUuid();
  const sign = Utilities.base64Encode(
    Utilities.computeHmacSha256Signature(token + t + nonce, secret));
  const res = UrlFetchApp.fetch(SB_API + path, {
    headers: { Authorization: token, sign: sign, nonce: nonce, t: t,
               'Content-Type': 'application/json; charset=utf8' },
    muteHttpExceptions: true
  });
  const j = JSON.parse(res.getContentText());
  if (j.statusCode !== 100) throw new Error('SwitchBot: ' + j.statusCode + ' ' + (j.message || ''));
  return j.body;
}

// エディタで▶実行すると、ちゃんと読めるかログで確認できるよ
function test() {
  Logger.log(doGet().getContent());
}
