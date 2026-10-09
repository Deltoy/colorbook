// 오프라인: 첫 방문 때 앱 파일을 저장해 두고, 인터넷이 없으면 저장본을 보여 준다 (파일을 바꾸면 VER 올리기)
var VER = 'cb-v3', FILES = ['./', 'index.html', 'fit.js', 'data.js', 'manifest.webmanifest', 'icon-180.png', 'icon-192.png', 'icon-512.png'];
self.addEventListener('install', function (e) { e.waitUntil(caches.open(VER).then(function (c) { return c.addAll(FILES); }).then(function () { return self.skipWaiting(); })); });
self.addEventListener('activate', function (e) { e.waitUntil(caches.keys().then(function (ks) { return Promise.all(ks.filter(function (k) { return k !== VER; }).map(function (k) { return caches.delete(k); })); }).then(function () { return self.clients.claim(); })); });
self.addEventListener('fetch', function (e) {
  if (e.request.method !== 'GET') return;
  e.respondWith(fetch(e.request).then(function (r) { if (r.ok && (r.type === 'basic' || r.type === 'cors')) { var cp = r.clone(); caches.open(VER).then(function (c) { c.put(e.request, cp); }); } return r; })
    .catch(function () { return caches.match(e.request, { ignoreSearch: true }).then(function (m) { return m || (e.request.mode === 'navigate' ? caches.match('index.html') : Response.error()); }); }));
});
