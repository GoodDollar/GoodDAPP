import { flattenDepth, fromPairs } from 'lodash'
import 'abortcontroller-polyfill/dist/polyfill-patch-fetch'
import { shimMethod } from './utils/shim'

shimMethod(Object, 'fromEntries', entries => {
  if (!entries || !entries[Symbol.iterator]) {
    throw new Error('Object.fromEntries() requires a single iterable argument')
  }

  return fromPairs(entries)
})

// shouldn't be arrow to access 'this'
shimMethod(Promise.prototype, 'finally', function(fn) {
  const onFinally = callback => Promise.resolve(fn()).then(callback)

  return this.then(result => onFinally(() => result), reason => onFinally(() => Promise.reject(reason)))
})

shimMethod(Array.prototype, 'flat', function(depth = null) {
  return flattenDepth(this, depth || 1)
})

shimMethod(Array.prototype, 'flatMap', function(iteratee) {
  return this.map(iteratee).flat()
})
