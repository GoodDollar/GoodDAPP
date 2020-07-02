import { isError, isObjectLike, isPlainObject } from 'lodash'
import pino from 'pino'
import redaction from 'pino/lib/redaction'
import { redactFmtSym } from 'pino/lib/symbols'
import { stringify } from 'pino/lib/tools'

import { isE2ERunning } from '../utils/platform'
import Config from '../../config/config'

const { logLevel, logSecureKeys, env } = Config

const pinoProxyHandler = new class {
  childrenMap = new WeakMap()

  methodsMap = new WeakMap()

  // debug is excluded as it's redirected to info
  censorLevels = ['error', 'fatal', 'warn', 'info', 'trace']

  get censor() {
    const { redactionApi } = this

    return redactionApi[redactFmtSym]
  }

  constructor(Config) {
    const { logsCensorshipPaths: paths, logCensorshipPlaceholder: censor } = Config

    this.redactionApi = redaction({ paths, censor }, stringify)
  }

  get(target, property) {
    if (!target.hasOwnProperty(property)) {
      return
    }

    if ('debug' === property) {
      return this.get(target, 'info')
    }

    if ('child' === property) {
      return this.wrapChildMethod(target)
    }

    const propertyValue = target[property]

    if ('function' === typeof propertyValue) {
      return this.wrapLoggerMethod(target, property, propertyValue)
    }

    return propertyValue
  }

  wrapChildMethod(target) {
    const { childrenMap } = this

    if (!childrenMap.has(target)) {
      childrenMap.set(target, (...args) => new Proxy(target.child(...args), pinoProxyHandler))
    }

    return childrenMap.get(target)
  }

  wrapLoggerMethod(target, methodName, methodFunction) {
    const { censorLevels, methodsMap } = this

    if (!methodsMap.has(target)) {
      methodsMap.set(
        target,
        censorLevels.includes(methodName)
          ? (...loggingArgs) => methodFunction.apply(target, this.applyConfidentialCensorship(loggingArgs))
          : methodFunction.bind(target)
      )
    }

    return methodsMap.get(target)
  }

  applyConfidentialCensorship(loggingArgs) {
    const { censor } = this

    return loggingArgs.map(loggingArgument => {
      // pino has different output fot errors only on the browser
      // also we won't call redaction on non-object args
      if (isError(loggingArgument) || (!isPlainObject(loggingArgument) && !isObjectLike(loggingArgument))) {
        return loggingArgument
      }

      return censor(loggingArgument)
    })
  }
}({
  logsCensorshipPaths: logSecureKeys.split(','),
  logCensorshipPlaceholder: '[CONFIDENTIAL]',
})

let logger

if (env === 'production') {
  logger = new Proxy(
    pino({
      level: logLevel,
    }),
    pinoProxyHandler
  )
} else {
  logger = pino({
    level: logLevel,
  })
}

if (isE2ERunning) {
  Object.assign(global, { logger })
}

export default logger

export const ExceptionCategory = {
  Human: 'human',
  Blockhain: 'blockchain',
  Network: 'network',
  Unexpected: 'unexpected',
}
