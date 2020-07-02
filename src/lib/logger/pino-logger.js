import pino from 'pino'
import redaction from 'pino/lib/redaction'
import { redactFmtSym } from 'pino/lib/symbols'

import { isE2ERunning } from '../utils/platform'
import Config from '../../config/config'

const { logLevel, logSecureKeys, env } = Config

const pinoProxyHandler = new class {
  childrenMap = new WeakMap()

  methodsMap = new WeakMap()

  // 'debug' is excluded as it's redirected to the 'info'
  censorLevels = ['error', 'fatal', 'warn', 'info', 'trace']

  censor = redaction(
    {
      paths: logSecureKeys.split(','),
      censor: '[CONFIDENTIAL]',
    },
    false
  )

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
        // eslint-disable-next-line no-negated-condition
        !censorLevels.includes(methodName)
          ? methodFunction.bind(target)
          : (...args) => {
              this.applyConfidentialCensorship(args)

              return methodFunction.apply(target, args)
            }
      )
    }

    return methodsMap.get(target)
  }

  applyConfidentialCensorship(loggingArgs) {
    for (const argument of loggingArgs) {
      this.censor[redactFmtSym](argument)
    }
  }
}()

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
