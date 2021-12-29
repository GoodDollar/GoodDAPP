import { assign, isError } from 'lodash'

export const setUnhandledRejectionHanlder = callback =>
  window.addEventListener('unhandledrejection', event => {
    const { reason } = event

    callback(reason)
    event.preventDefault()
  })

export const setUncaughExceptionHandler = callback =>
  window.addEventListener('error', event => {
    const { error, message, filename, lineno, colno } = event
    let exception = error

    if (!isError(error)) {
      exception = new Error(message)

      assign(exception, {
        fileName: filename,
        lineNumber: lineno,
        columnNumber: colno,
      })
    }

    callback(exception)
    event.preventDefault()
  })
