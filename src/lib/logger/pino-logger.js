import pino from 'pino'
import redaction from 'pino/lib/redaction'
import EventEmitter from 'eventemitter3'

import { redactFmtSym } from 'pino/lib/symbols'
import { stringify } from 'pino/lib/tools'

import { bindAll, filter, flatten, isError, isFunction, isObjectLike, isPlainObject, keys } from 'lodash'

import { isE2ERunning } from '../utils/platform'
import Config from '../../config/config'

export const ExceptionCategory = {
  Human: 'human',
  Blockchain: 'blockchain',
  Network: 'network',
  Unexpected: 'unexpected',
}

const { prototype: eeProto } = EventEmitter

class SecureLogger extends EventEmitter {
  childrenMap = new WeakMap()

  methodsMap = new WeakMap()

  // debug is excluded as it's redirected to info
  censorLevels = ['error', 'fatal', 'warn', 'info', 'trace']

  eventEmitterMethods = filter(keys(eeProto), prop => isFunction(eeProto[prop]))

  get censor() {
    const { redactionApi } = this

    return redactionApi[redactFmtSym]
  }

  constructor(Config) {
    super()

    const { secureLog, secureLogKeys, secureLogCensor, logLevel } = Config
    const logger = pino({ level: logLevel, browser: { transmit: this } })

    // if secure logs enabled - preparing redaction paths
    if (secureLog) {
      const censor = secureLogCensor
      const paths = flatten(
        secureLogKeys.split(',').map(key => {
          const secureKey = key.trim()

          if (!secureKey) {
            return []
          }

          return [secureKey, `*.${secureKey}`]
        })
      )

      this.redactionApi = redaction({ paths, censor }, stringify)
    }

    this.secureLog = secureLog
    bindAll(this, this.eventEmitterMethods)

    // returning proxy-wrapped logger
    return new Proxy(logger, this)
  }

  get(target, property) {
    if (!target.hasOwnProperty(property)) {
      return
    }

    // proxy EventEmitter methods
    if (this.eventEmitterMethods.includes(property)) {
      return this[property]
    }

    // logger.debug = logger.info substitution from old implementation
    if ('debug' === property) {
      return this.get(target, 'info')
    }

    // auto wrapping children loggers to the Proxy
    if ('child' === property) {
      return this.wrapChildMethod(target)
    }

    const propertyValue = target[property]

    // proxying logger methods
    if ('function' === typeof propertyValue) {
      return this.wrapLoggerMethod(target, property, propertyValue)
    }

    return propertyValue
  }

  wrapChildMethod(target) {
    const { childrenMap } = this

    if (!childrenMap.has(target)) {
      childrenMap.set(target, (...args) => new Proxy(target.child(...args), this))
    }

    return childrenMap.get(target)
  }

  wrapLoggerMethod(target, methodName, methodFunction) {
    const { censorLevels, methodsMap, secureLog } = this

    if (!methodsMap.has(target)) {
      let wrappedMethod = methodFunction.bind(target)

      if (secureLog && censorLevels.includes(methodName)) {
        wrappedMethod = (...loggingArgs) => {
          const redactedArgs = this.applyConfidentialCensorship(loggingArgs)

          return methodFunction.apply(target, redactedArgs)
        }
      }

      methodsMap.set(target, wrappedMethod)
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

  send(level, logEvent) {
    const events = ['log', `log:${level}`]

    events.forEach(event => this.emit(event, logEvent))
  }
}

const logger = new SecureLogger(Config)

if (isE2ERunning) {
  Object.assign(global, { logger })
}

export default logger
