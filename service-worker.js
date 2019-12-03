addEventListener('message', messageEvent => {
  if (messageEvent.data === 'skipWaiting') {
    workbox.core.skipWaiting();
    workbox.core.clientsClaim();
  }
});
/**
 * The workboxSW.precacheAndRoute() method efficiently caches and responds to
 * requests for URLs in the manifest.
 * See https://goo.gl/S9QRab
 */
self.__precacheManifest = [].concat(self.__precacheManifest || []);
workbox.precaching.precacheAndRoute(self.__precacheManifest, {});
workbox.routing.registerNavigationRoute(workbox.precaching.getCacheKeyForURL("/index.html"), {
  blacklist: [/^\/_/,/\/[^\/]+\.[^\/]+$/],
});
workbox.routing.registerRoute(/static/, new workbox.strategies.StaleWhileRevalidate({ plugins: [new workbox.cacheableResponse.Plugin({ statuses: [ 200 ] })] }), 'GET');
