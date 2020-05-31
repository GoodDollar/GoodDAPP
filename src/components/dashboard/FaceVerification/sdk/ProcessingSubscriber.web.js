import { omit } from 'lodash'

export class ProcessingSubscriber {
  constructor(onUIReady, logger) {
    this.logger = logger
    this.onUIReady = onUIReady

    this._promise = new Promise((resolve, reject) => {
      this._resolve = resolve
      this._reject = reject
    })
  }

  // eslint-disable-next-line require-await
  async asPromise() {
    return this._promise
  }

  onSessionCompleted(isSuccess, lastResult, lastMessage) {
    const { logger, _resolve, _reject } = this
    const logRecord = { isSuccess, lastMessage }

    if (lastResult) {
      logRecord.lastResult = omit(lastResult, 'faceMetrics')
    }

    logger[isSuccess ? 'info' : 'warn']('processor result:', logRecord)

    if (isSuccess) {
      _resolve(lastMessage)
    }

    const exception = new Error(lastMessage)

    if (lastResult) {
      exception.code = lastResult.status
    }

    _reject(exception)
  }
}
