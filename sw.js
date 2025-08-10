const CACHE='ai-coach-v7'; // อัปหมายเลขเมื่ออัปเดตใหญ่ ๆ
const ASSETS=[
  './','./index.html','./style.css','./app.js',
  './dashboard.html','./dashboard.js','./firebase-config.json'
];

self.addEventListener('install',e=>{
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)));
  self.skipWaiting();
});
self.addEventListener('activate',e=>{
  e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener('fetch',e=>{
  e.respondWith(
    caches.match(e.request).then(r=> r || fetch(e.request).then(res=>{
      const copy=res.clone(); caches.open(CACHE).then(c=>c.put(e.request, copy)); return res;
    }).catch(()=>caches.match('./index.html')))
  );
});
