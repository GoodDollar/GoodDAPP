function isFunction(functionToCheck) {
  return typeof functionToCheck === 'function'
}

const wrapper = (target, store) => {
  const beforeFetching = () =>
    store.set('currentScreen')({
      loading: true
    })

  const afterFetching = () =>
    store.set('currentScreen')({
      loading: false
    })

  const errorHandler = error => {
    let message = 'Unknown Error'
    if (error.response && error.response.data) {
      message = error.response.data.message
    }
    if (error.message) {
      message = error.message
    }
    if (error.err) {
      message = error.err
    }
    store.set('currentScreen')({
      dialogData: { visible: true, title: 'Error', message, dismissText: 'OK' },
      loading: false
    })
  }

  return new Proxy(target, {
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

export default wrapper
