import 'abortcontroller-polyfill/dist/polyfill-patch-fetch'

/* eslint-disable no-extend-native */
if (!Object.fromEntries) {
  Object.defineProperty(Object, 'fromEntries', {
    value(entries) {
      if (!entries || !entries[Symbol.iterator]) {
        throw new Error('Object.fromEntries() requires a single iterable argument')
      }

      const o = {}

      Object.keys(entries).forEach(key => {
        const [k, v] = entries[key]

        o[k] = v
      })

      return o
    },
  })
}

Promise.prototype.finally =
  Promise.prototype.finally ||
  {
    finally(fn) {
      const onFinally = callback => Promise.resolve(fn()).then(callback)
      return this.then(result => onFinally(() => result), reason => onFinally(() => Promise.reject(reason)))
    },
  }.finally
