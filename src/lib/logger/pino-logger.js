import pino from 'pino'
import redaction from 'pino/lib/redaction'
import EventEmitter from 'eventemitter3'

import { redactFmtSym } from 'pino/lib/symbols'

import {
  bindAll,
  cloneDeep,
  filter,
  flatten,
  isError,
  isFunction,
  isObjectLike,
  isPlainObject,
  keys,
  zipObject,
} from 'lodash'

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
  methodsMap = {}

  childrenMap = new WeakMap()

  // debug is excluded as it's redirected to info
  logMethods = ['error', 'fatal', 'warn', 'info', 'trace']

  eventEmitterMethods = filter(keys(eeProto), prop => isFunction(eeProto[prop]))

  get censor() {
    const { redactionApi } = this

    return redactionApi[redactFmtSym]
  }

  constructor(Config) {
    super()

    const { secureLog, secureLogKeys, secureLogCensor, logLevel, transmitLogLevel } = Config

    const logger = pino({
      level: logLevel,
      browser: {
        transmit: {
          // transmit.level property specifies the minimum level (inclusive) of when the send fn should be called
          level: transmitLogLevel,
          send: (level, logEvent) => this.broadcastLog(level, logEvent),
        },
      },
    })

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

      this.redactionApi = redaction({ paths, censor }, false)
    }

    const { eventEmitterMethods, logMethods } = this

    this.secureLog = secureLog
    this.methodsMap = zipObject(logMethods, logMethods.map(() => new WeakMap()))

    bindAll(this, eventEmitterMethods)

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
    const { logMethods, secureLog } = this
    const methodMap = this.getMethodMap(methodName)

    if (!methodMap.has(target)) {
      let wrappedMethod = methodFunction.bind(target)

      if (secureLog && logMethods.includes(methodName)) {
        wrappedMethod = (...loggingArgs) => {
          const redactedArgs = this.applyConfidentialCensorship(cloneDeep(loggingArgs))

          return methodFunction.apply(target, redactedArgs)
        }
      }

      methodMap.set(target, wrappedMethod)
    }

    return methodMap.get(target)
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

  getMethodMap(methodName) {
    const { methodsMap } = this

    if (!(methodName in methodsMap)) {
      methodsMap[methodName] = new WeakMap()
    }

    return methodsMap[methodName]
  }

  broadcastLog(level, logEvent) {
    const events = ['log', `log:${level}`]

    events.forEach(event => this.emit(event, logEvent))
  }
}

const logger = new SecureLogger(Config)

if (isE2ERunning) {
  Object.assign(global, { logger })
}

export default logger
