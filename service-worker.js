const CACHE_VERSION = 'v3';
const CACHE_NAME = `libre-tv-${CACHE_VERSION}`;

// 核心资源列表（仅缓存不会频繁变动的库文件）
const PRECACHE_URLS = [
  '/',
  '/css/styles.css',
  '/libs/tailwindcss.min.js',
  '/libs/DPlayer.min.js',
  '/libs/hls.min.js',
  '/libs/sha256.min.js',
  '/manifest.json'
];

// Service Worker 安装——预缓存核心资源
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('[SW] Pre-caching core resources');
      return cache.addAll(PRECACHE_URLS).catch(err => {
        console.warn('[SW] Pre-cache failed for some resources:', err);
      });
    })
  );
  // 立即激活，不等待旧 SW 关闭
  self.skipWaiting();
});

// Service Worker 激活——清理旧缓存
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames
          .filter(name => name.startsWith('libre-tv-') && name !== CACHE_NAME)
          .map(name => {
            console.log('[SW] Deleting old cache:', name);
            return caches.delete(name);
          })
      );
    })
  );
  // 立即接管所有页面
  self.clients.claim();
});

// 网络优先策略——确保始终获取最新内容
self.addEventListener('fetch', event => {
  // 跳过非 GET 请求和 Chrome 扩展请求
  if (event.request.method !== 'GET') return;
  
  const url = new URL(event.request.url);
  
  // 跳过代理请求（/proxy/ 路径）
  if (url.pathname.startsWith('/proxy/')) return;
  
  // 跳过外部资源
  if (url.origin !== self.location.origin) return;
  
  event.respondWith(
    // 网络优先：先尝试网络，失败时回退到缓存
    fetch(event.request)
      .then(networkResponse => {
        // 成功获取网络响应，更新缓存
        const responseClone = networkResponse.clone();
        caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, responseClone);
        });
        return networkResponse;
      })
      .catch(() => {
        // 网络失败时回退到缓存
        return caches.match(event.request).then(cachedResponse => {
          if (cachedResponse) {
            return cachedResponse;
          }
          // 如果是导航请求（HTML 页面），返回缓存的首页
          if (event.request.mode === 'navigate') {
            return caches.match('/');
          }
          // 否则返回离线提示
          return new Response('Offline - Please check your network connection', {
            status: 503,
            statusText: 'Service Unavailable'
          });
        });
      })
  );
});
