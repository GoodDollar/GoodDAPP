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

function Handler(showDialog, params) {
  const { onDismiss } = params || {}

  this.errorHandler = error => {
    let message = 'Unknown Error'
    if (error.response && error.response.data) {
      message = error.response.data.message
    } else if (error.message) {
      message = error.message
    } else if (error.err) {
      message = error.err
    }
    showDialog({ visible: true, title: 'Error', message, onDismiss, type: 'error' })
  }
}

export const wrapFunction = (fn, showDialog, params) => {
  const handler = new Handler(showDialog, params)
  return wrapperFunction(fn, null, handler)
}

const wrapper = (target, showDialog, params) => {
  const handler = new Handler(showDialog, params)
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
