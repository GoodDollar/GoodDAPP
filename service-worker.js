
let idbKeyval = (() => {
  let db;

  function getDB() {
    if (!db) {
      db = new Promise((resolve, reject) => {
        const openreq = indexedDB.open('svgo-keyval', 1);

        openreq.onerror = () => {
          reject(openreq.error);
        };

        openreq.onupgradeneeded = () => {
          // First time setup: create an empty object store
          openreq.result.createObjectStore('keyval');
        };

        openreq.onsuccess = () => {
          resolve(openreq.result);
        };
      });
    }
    return db;
  }

  async function withStore(type, callback) {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction('keyval', type);
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
      callback(transaction.objectStore('keyval'));
    });
  }

  return {
    async get(key) {
      let req;
      await withStore('readonly', store => {
        req = store.get(key);
      });
      return req.result;
    },
    set(key, value) {
      return withStore('readwrite', store => {
        store.put(value, key);
      });
    },
    delete(key) {
      return withStore('readwrite', store => {
        store.delete(key);
      });
    }
  };
})();

// iOS add-to-homescreen is missing IDB, or at least it used to.
// I haven't tested this in a while.
if (!self.indexedDB) {
  idbKeyval = {
    get: key => Promise.resolve(localStorage.getItem(key)),
    set: (key, val) => Promise.resolve(localStorage.setItem(key, val)),
    delete: key => Promise.resolve(localStorage.removeItem(key))
  };
}

self.addEventListener('install', async event => {
  const version = new URL(location).searchParams.get('version');
  await idbKeyval.set('version', version)
  console.log("SERVICE_WORKER install version", version)
});
workbox.core.setCacheNameDetails({ prefix: 'd4' })
//Change this value every time before you build

self.addEventListener('activate', async (event) => {
  let version = await  idbKeyval.get('version')
  console.log(`%c SERVICE_WORKER version from idb ${version} `, 'background: #ddd; color: #0000ff')
  if (caches) {
    caches.keys().then((arr) => {
      arr.forEach((key) => {
        if (key.indexOf('d4-precache') < -1) {
          caches.delete(key).then(() => console.log(`%c Cleared ${key}`, 'background: #333; color: #ff0000'))
        } else {
          caches.open(key).then((cache) => {
            cache.match('version').then((res) => {
              if (!res) {
                cache.put('version', new Response(version, { status: 200, statusText: version }))
              } else if (res.statusText !== version) {
                caches.delete(key).then(() => console.log(`%c Cleared Cache ${version}`, 'background: #333; color: #ff0000'))
              } else console.log(`%c Great you have the latest version ${version}`, 'background: #333; color: #00ff00')
            })
          })
        }
      })
    })
  }
})

workbox.core.skipWaiting()
workbox.core.clientsClaim()

self.__precacheManifest = [].concat(self.__precacheManifest || [])
workbox.precaching.precacheAndRoute(self.__precacheManifest, {})

