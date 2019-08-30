function isFunction(functionToCheck) {
  return typeof functionToCheck === 'function'
}

const wrapperFunction = (origMethod, target, handler) => {
  return function(...args) {
    // handler.beforeFetching()
    let result = origMethod.apply(target, args)
    if (result && isFunction(result.then)) {
      result.catch(handler.errorHandler)
    } else {
      // handler.afterFetching()
    }
    return result
  }
}

function Handler(store, params) {
  const { onDismiss } = params || {}

  // this.beforeFetching = () =>
  //   store.set('currentScreen')({
  //     loading: true
  //   })

  // this.afterFetching = () =>
  //   store.set('currentScreen')({
  //     loading: false
  //   })

  this.errorHandler = error => {
    let message = 'Unknown Error'
    if (error.response && error.response.data) {
      message = error.response.data.message
    } else if (error.message) {
      message = error.message
    } else if (error.err) {
      message = error.err
    }
    store.set('currentScreen')({
      dialogData: { visible: true, title: 'Error', message, onDismiss },
    })
  }
}

export const wrapFunction = (fn, store, params) => {
  const handler = new Handler(store, params)
  return wrapperFunction(fn, null, handler)
}

const wrapper = (target, store, params) => {
  const handler = new Handler(store, params)
  return new Proxy(target, {
    get: function(target, name, receiver) {
      const origMethod = target[name]
      if (!isFunction(target[name])) {
        return target[name]
      }
      return wrapperFunction(origMethod, target, handler)
    },
  })
}

export default wrapper
