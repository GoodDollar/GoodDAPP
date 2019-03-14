import API from './api'
import GDStore from '../undux/GDStore'

function isFunction(functionToCheck) {
  return typeof functionToCheck === 'function'
}

export const useApi = () => {
  const store = GDStore.useStore()
  const beforeFetching = () =>
    store.set('currentScreen')({
      loading: true
    })

  const afterFetching = () =>
    store.set('currentScreen')({
      loading: false
    })

  const errorHandler = error => {
    const message = error && error.response && error.response.data ? error.response.data.message : error.message
    store.set('currentScreen')({
      dialogData: { visible: true, title: 'Error', message, dismissText: 'OK' },
      loading: false
    })
  }

  return new Proxy(API, {
    get: function(target, name, receiver) {
      const origMethod = target[name]
      if (!isFunction(target[name])) {
        return target[name]
      } else {
        return function(...args) {
          beforeFetching()
          let result = origMethod.apply(target, args)
          if (isFunction(result.then)) {
            result.then(afterFetching).catch(errorHandler)
          }
          return result
        }
      }
    }
  })
}
