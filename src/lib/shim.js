import { fromPairs } from 'lodash'
import 'abortcontroller-polyfill/dist/polyfill-patch-fetch'

const shim = (object, method, implementation) => {
  if ('function' === typeof object[method]) {
    return
  }

  Object.defineProperty(object, method, { value: implementation })
}

shim(Object, 'fromEntries', entries => {
  if (!entries || !entries[Symbol.iterator]) {
    throw new Error('Object.fromEntries() requires a single iterable argument')
  }

  return fromPairs(entries)
})

// shouldn't be arrow to access 'this'
shim(Promise.prototype, 'finally', function(fn) {
  const onFinally = callback => Promise.resolve(fn()).then(callback)

  return this.then(result => onFinally(() => result), reason => onFinally(() => Promise.reject(reason)))
})
