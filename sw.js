// ゆめいろ手帳（旧ゆめいろ発車ベル）:電波がなくても開けるようにするための仕組み
// オンラインのときは毎回最新のページを取りに行き、取れなかったときだけ保存しておいたページを使う
const CACHE="yumebell-v67";
self.addEventListener("install",e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(["./","./index.html","./fm-help.js?v=20261127a","./fm.js?v=20261127a","./shift-ocr-parse.js?v=20261127a","./shift-img.js?v=20261127a"])).then(()=>self.skipWaiting()))});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener("fetch",e=>{
  const u=new URL(e.request.url);
  if(e.request.method!=="GET"||u.origin!==location.origin)return; // 動画は部分読み込み（Range）になるので、保存しないでそのままネットから
  if(/\.(mp4|webm|mov)$/i.test(u.pathname))return; // 天気や警報などは対象外
  // 絵（jpg・webp・png など）は保存してあればそれを使う。電波が弱くてもすぐ開けるように（2026-11-22）。絵を差し替えるときはファイル名か ?v= を変えてね
  if(/\.(jpe?g|png|webp|gif|svg|ico)$/i.test(u.pathname)){
    e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request).then(res=>{if(res.ok){const c=res.clone();caches.open(CACHE).then(x=>x.put(e.request,c))}return res})));return}
  // 画面やプログラムは新しいのを取りにいくけど、電波が弱くて3秒たっても来ないときは保存してあるのですぐ開く。
  // 取りにいった新しいのは裏で保存しておくので、次に開いたときに新しくなるよ（2026-11-27）
  const net=fetch(e.request,{cache:"no-cache"}).then(r=>{if(r.ok){const c=r.clone();caches.open(CACHE).then(x=>x.put(e.request,c))}return r});
  e.waitUntil(net.then(()=>{},()=>{}));
  e.respondWith(Promise.race([net.catch(()=>null),new Promise(ok=>setTimeout(()=>ok(null),3000))])
    .then(r=>r||caches.match(e.request).then(c=>c||net.catch(()=>caches.match("./index.html")))));
});
