const CACHE_NAME = 'ahlawy-store-v3'; // رفعنا الإصدار للتحديث

// القائمة المحدثة بناءً على ملفاتك
const assets = [
  '/',
  '/index.html',
  '/admin.html',
  '/style.css',
  '/script.js',
  '/qrcode.min.js',
  '/games.json',
  '/logo.png',
  '/ps4.png',
  '/ps5.png',
  '/PS4/index.html',
  '/PS5/index.html'
];

// مرحلة التثبيت: حفظ الملفات الأساسية
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('تم حفظ واجهة أهلاوي ستور 🦅');
      return cache.addAll(assets);
    })
  );
});

// مرحلة الجلب (Fetch): تعديل ذكي لحفظ صور الألعاب أوتوماتيكياً
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      // إذا وجدنا الملف في الكاش نعرضه فوراً
      if (response) return response;

      // إذا لم يوجد (مثل صور الألعاب الجديدة)، نحمله من النت ونحفظ نسخة منه فوراً
      return fetch(event.request).then(networkResponse => {
        // نتأكد أن الطلب لصور الألعاب لكي نحفظه
        if (event.request.url.includes('/img/')) {
           return caches.open(CACHE_NAME).then(cache => {
             cache.put(event.request, networkResponse.clone());
             return networkResponse;
           });
        }
        return networkResponse;
      });
    })
  );
});