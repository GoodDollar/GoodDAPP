/*
 * see-other! redirecting subresource requests to their permanent web3 alternatives.
 *
 * WARNING: service workers are isolated and stateless and hard to debug...
 *   - dont try and update global variables.
 *   - we can't access localStorage.
 *   - we can access IndexedDb (gross)
 *   - we can access the Cache api...
 *
 * So:
 *   - get dnslink from Cache
 *   - if missing fetch dnslink from api
 *   - if dnslink older than x update dnslink
 *   - redirect resource url to cid url
 */

// insert your prefered IPFS gateway here
const GATEWAY_URL = 'https://w3s.link'
// this needs to be separated. as cloudflare-ipfs.com we use a gateway doesnt support DNS queries
const DNSLINK_GW_URL = 'https://ipfs.io'

const REDIRECT_ALSO_IPFS = [GATEWAY_URL, 'https://cloudflare-ipfs.com', 'https://ipfs.io', 'https://nftstorage.link']
// only change this if you are hacking things and decide to change what you want cached.
const DNSLINK_CACHE = 'dnslink-v1'

// useful for testing to point at a domain with a dnslink
const DNSLINK_DOMAIN = location.hostname

// how long before we refetch the dnslink
const STALE_AFTER_MS = 1000 * 60 * 60 // 1hr

/*
 * The install event is your chance to cache everything you need before being able to control clients.
 * The promise you pass to event.waitUntil() lets the browser know when your install completes, and if it was successful.
 * https://developers.google.com/web/fundamentals/primers/service-workers/lifecycle
 *
 * This function must be sync, any async work needs to be done in the function passed to event.waitUntil
 *
 * @param {LifecycleEvent} event
 */
const oninstall = async (event) => {
    event.waitUntil(event.target.skipWaiting())
}

/*
 * Once your service worker is ready to control clients and handle functional events like push and sync,
 * you'll get an activate event. But that doesn't mean the page that called .register() will be controlled.
 * @param {LifecycleEvent} event
 */
const onactivate = async (event) => {
    console.log('🤖 onactivate', event)
    // We want to start handling requests right away, so that requests from the
    // very first page will be handled by service worker. Which is why we claim
    // clients.
    event.waitUntil(event.target.clients.claim())
}

/*
 * An event handler called whenever a fetch event occurs
 * "Alternatively, simply don't call event.respondWith, which will result in default browser behaviour."
 * @param {Fetch} event
 */
const onfetch = (event) => {
    if (event.request.mode === 'navigate') {
        console.log('onfetch ignored', event.request.mode)
        return // skip page requests... for now
    }

    const url = new URL(event.request.url)
    // Only handle pages for the current origin
    // Requests to other origins are left to the browser default
    // Requests to ipfs gateway without /ipfs are also rewritten
    if (
        url.origin === location.origin ||
        (url.pathname.includes('/ipfs/') === false && REDIRECT_ALSO_IPFS.includes(url.origin))
    ) {
        event.respondWith(redirectToPermenantUrl(url))
    }
}

async function redirectToPermenantUrl(url) {
    const dnslink = await fetchDnsLink()
    const gatewayUrl = toGatewayUrl(url, dnslink)

    console.log(`🤖 ${url.pathname} → ${gatewayUrl}`)
    return Response.redirect(gatewayUrl, 303)
}

function toGatewayUrl(url, dnslink) {
    return `${GATEWAY_URL}${dnslink}${url.pathname}${url.search}${url.hash}`
}

async function fetchDnsLink() {
    const apiUrl = `${DNSLINK_GW_URL}/api/v0/dns?arg=${DNSLINK_DOMAIN}`
    const cache = await caches.open(DNSLINK_CACHE)
    let res = await cache.match(apiUrl)
    const cachedAt = (res && res.headers.get('x-cached-at')) || 0
    const isStale = Date.now() - cachedAt > STALE_AFTER_MS

    if (!res || isStale) {
        if (isStale) {
            console.log('💀 dnslink from cache is stale')
        }

        res = await fetch(apiUrl)

        // the original response has no headers, due to CORS restrictions (assumed)
        // we have to clone the resposne to cache it and read it too, so we manaully
        // do so here to add a header we can use to determine if we should update.
        // https://stackoverflow.com/questions/42585254/is-it-possible-to-modify-service-worker-cache-response-headers
        const resWithDate = new Response(res.clone().body, {
            headers: new Headers({
                'x-cached-at': Date.now(),
            }),
        })

        console.log('🛰 fetched dnslink')
        // update the entry in the cache... TODO: this could happen in the background.
        await cache.put(apiUrl, resWithDate)
    } else {
        console.log('👻 dnslink from cache')
    }

    const { Path } = await res.json()

    return Path
}

/**
 * Sets up service worker event handlers.
 * @param {any} self
 */
const setup = (self) => {
    self.oninstall = oninstall
    self.onactivate = onactivate
    self.onfetch = onfetch
}

setup(self)
