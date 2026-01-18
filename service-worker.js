const CACHE_NAME = 'ahlawy-store-cache-v1';
const urlsToCache = [
  './', 
  './index.html',
  './style.css',
  './script.js',      // ضروري جداً لتشغيل كود عرض الألعاب
  './games.json',     // قاعدة بيانات الـ 500 لعبة
  './logo.png',
  './ps4.png',
  './ps5.png',
  './manifest.json',
  './PS4/index.html',
  './PS5/index.html'
];
// مرحلة التثبيت وحفظ الملفات
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Cache Opened Successfully');
        // استخدام cache.addAll يضمن تحميل كل القائمة بالترتيب
        return cache.addAll(urlsToCache);
      })
  );
});

// استدعاء الملفات من الكاش عند انقطاع الإنترنت
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        // إذا وجد الملف في الكاش نعرضه، وإلا نطلبه من الشبكة
        return cachedResponse || fetch(event.request);
      })
  );
});

// تنظيف الكاش القديم (ميزة مأخوذة من فلسفة v1.02 للتنظيف)
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});