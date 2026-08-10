// Service Worker 自毁脚本
// 清除所有旧缓存，然后注销自身
// 该站点不需要 Service Worker — 视频搜索不需要离线缓存

const SELF_DESTRUCT = 'v5-self-destruct';

// 立即激活
self.addEventListener('install', event => {
  console.log('[SW] Self-destruct install — clearing all caches');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(name => {
          console.log('[SW] Deleting cache:', name);
          return caches.delete(name);
        })
      );
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  console.log('[SW] Self-destruct activate — unregistering');
  // 再次清除所有缓存（以防万一）
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(cacheNames.map(name => caches.delete(name)));
    }).then(() => {
      // 注销自身
      return self.registration.unregister();
    })
  );
  self.clients.claim();
});

// 不拦截任何请求 — 全部直通网络
self.addEventListener('fetch', event => {
  // 不做任何事，浏览器直接走网络
});
