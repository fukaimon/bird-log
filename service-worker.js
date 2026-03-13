const CACHE_NAME = "birdlog-cache-v2"

const urlsToCache = [
"./",
"./index.html",
"./style.css",
"./app.js",
"./manifest.json"
]

// インストール
self.addEventListener("install", event => {

event.waitUntil(
caches.open(CACHE_NAME)
.then(cache => cache.addAll(urlsToCache))
)

})

// 古いキャッシュ削除
self.addEventListener("activate", event => {

event.waitUntil(
caches.keys().then(cacheNames => {

return Promise.all(
cacheNames.map(cache => {

if(cache !== CACHE_NAME){
return caches.delete(cache)
}

})
)

})
)

})

// fetch
self.addEventListener("fetch", event => {

event.respondWith(
caches.match(event.request)
.then(response => response || fetch(event.request))
)

})
