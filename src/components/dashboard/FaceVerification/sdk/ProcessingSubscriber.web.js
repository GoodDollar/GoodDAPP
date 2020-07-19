import { omit } from 'lodash'

export class ProcessingSubscriber {
  constructor(onUIReady, onCaptureDone, onRetry, logger) {
    this.logger = logger
    this.onRetry = onRetry
    this.onUIReady = onUIReady
    this.onCaptureDone = onCaptureDone

    this._promise = new Promise((resolve, reject) => {
      this._resolve = resolve
      this._reject = reject
    })
  }

  onDuplicate() {}

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
      return
    }

    const exception = new Error(lastMessage)

    if (lastResult) {
      exception.code = lastResult.status
    }

    _reject(exception)
  }
}
