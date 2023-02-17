const isServiceWorkerSupported = 'serviceWorker' in navigator

function getServiceWorkerUrl(): string {
    const url = new URL(document.location.href)

    url.pathname = '/service-worker.js'
    url.hash = ''
    url.search = ''
    return url.toString()
}

export function registerServiceWorker(): void {
    if (!isServiceWorkerSupported) {
        return
    }

    window.addEventListener('load', () => {
        const swUrl = getServiceWorkerUrl()

        navigator.serviceWorker.register(swUrl).catch((error) => {
            console.error('serviceWorker', 'Error during service worker registration:', error)
        })
    })
}

export function unregister() {
    if (!isServiceWorkerSupported) {
        return
    }

    const onError = (error: any) => {
        console.error('serviceWorker', 'Error unregistering service worker', error)
    }

    navigator.serviceWorker.ready
        .then((registration) => {
            registration.unregister().catch(onError)
        })
        .catch(onError)
}
