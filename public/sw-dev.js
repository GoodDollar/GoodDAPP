// This service worker file is effectively a 'no-op' that will reset any
// previous service worker registered for the same host:port combination.
// In the production build, this file is replaced with an actual service worker
// file that will precache your site's local assets.
// See https://github.com/facebook/create-react-app/issues/2272#issuecomment-302832432

self.addEventListener('install', () => self.skipWaiting())

/*self.addEventListener('activate', () => {
  self.clients.matchAll({ type: 'window' }).then(windowClients => {
    for (let windowClient of windowClients) {
      // Force open pages to refresh, so that they have a chance to load the
      // fresh navigation response from the local dev server.
      windowClient.navigate(windowClient.url)
    }
  })
})
self.addEventListener('fetch', () => {})*/

const SHARED_DATA_ENDPOINT = '/logindata'

// see: https://developer.mozilla.org/en-US/docs/Web/API/Clients/claim
self.addEventListener('activate', event => {
  self.clients.matchAll({ type: 'window' }).then(windowClients => {
    for (let windowClient of windowClients) {
      // Force open pages to refresh, so that they have a chance to load the
      // fresh navigation response from the local dev server.
      windowClient.navigate(windowClient.url)
    }
  })

  event.waitUntil(clients.claim())
})

self.addEventListener('fetch', function(event) {
  const {
    request,
    request: { url, method },
  } = event

  if (url.match(SHARED_DATA_ENDPOINT)) {
    if (method === 'POST') {
      request.json().then(body => {
        caches.open(SHARED_DATA_ENDPOINT).then(function(cache) {
          cache.put(SHARED_DATA_ENDPOINT, new Response(JSON.stringify(body)))
        })
      })

      return new Response('{}')
    }

    event.respondWith(
      caches.open(SHARED_DATA_ENDPOINT).then(function(cache) {
        return cache.match(SHARED_DATA_ENDPOINT).then(
          function (response) {
            return response || new Response('{}')
          }) || new Response('{}')
      })
    )
  } else {
    return event
  }
})
