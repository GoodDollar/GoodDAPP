// This service worker file is effectively a 'no-op' that will reset any
// previous service worker registered for the same host:port combination.
// In the production build, this file is replaced with an actual service worker
// file that will precache your site's local assets.
// See https://github.com/facebook/create-react-app/issues/2272#issuecomment-302832432
const v = 1
self.addEventListener('install', () => {})
self.addEventListener('message', event => {
  console.log('service worker self message', { event })
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
})
self.addEventListener('activate', () => {
  // self.clients.matchAll({ type: 'window' }).then(windowClients => {
  //   for (let windowClient of windowClients) {
  //     // Force open pages to refresh, so that they have a chance to load the
  //     // fresh navigation response from the local dev server.
  //     windowClient.navigate(windowClient.url)
  //   }
  // })
})
self.addEventListener('fetch', () => {})
