import { cloneDeep, fromPairs, has, isFunction, keys, range } from 'lodash'

import { propertyDescriptor } from '../utils/object'

const MAX_EXCEPTION_CODE = 15
const codeToString = code => `E${code}`

// eslint-disable-next-line require-await
const wrapperFunction = (origMethod, target, handler) => async (...args) => {
  let result = origMethod.apply(target, args)

  if (result && isFunction(result.then)) {
    result.catch(handler.errorHandler)
  }

  return result
}

class Handler {
  constructor(showDialog, params) {
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
}

export const ExceptionCategory = {
  Human: 'human',
  Blockchain: 'blockchain',
  Network: 'network',
  Unexpected: 'unexpected',
}

export const ExceptionCode = fromPairs(range(1, MAX_EXCEPTION_CODE + 1).map(code => [codeToString(code), code]))
export const TorusException = {
  userCancel: 'UserCancelledException',
  noAllowedBrowserFound: 'NoAllowedBrowserFoundException',
}

/**
 * Decorates exception with pre-defined error code and returns message for the endusers
 *
 * @param {Error} exception Exception to decorate with code & name for Sentry reporting
 * @param {number} withCode Predefined error code
 * @returns Message could be shown for the endusers
 */
export const decorate = (exception, withCode) => {
  const { name, code } = exception

  if (!code) {
    exception.code = withCode
  }

  const codeString = codeToString(withCode)

  if (!name || 'Error' === name) {
    exception.name = codeString
  }

  return `Sorry, something unexpected happened, please try again. \nError: ${codeString}`
}

export const cloneErrorObject = exception => {
  // Create a new error...
  const err = new exception.constructor(exception.message)

  // If a `stack` property is present, copy it over...
  if (exception.stack) {
    err.stack = exception.stack
  }

  // Node.js specific (system errors)...
  if (exception.code) {
    err.code = exception.code
  }

  if (exception.errno) {
    err.errno = exception.errno
  }

  if (exception.syscall) {
    err.syscall = exception.syscall
  }

  // Any enumerable properties...
  const errKeys = keys(exception)

  for (let key of errKeys) {
    const desc = propertyDescriptor(exception, key)

    if (has(desc, 'value')) {
      desc.value = cloneDeep(exception[key])
    }

    Object.defineProperty(exception, key, desc)
  }

  return err
}

export const wrapFunction = (fn, showDialog, params) => {
  const handler = new Handler(showDialog, params)

  return wrapperFunction(fn, null, handler)
}

export const wrapper = (target, showDialog, params) => {
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
