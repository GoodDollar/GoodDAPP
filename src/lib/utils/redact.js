import redaction from 'pino/lib/redaction'
import { wildcardFirstSym } from 'pino/lib/symbols'
import { flatten, isFunction, isNull, isObject } from 'lodash'

export default class Redact {
  censors = null

  wildcardCensor = null

  topCensors = {}

  constructor(keys, censor) {
    const paths = flatten(
      keys.split(',').map(key => {
        const secureKey = key.trim()

        if (!secureKey) {
          return []
        }

        return [secureKey, `${secureKey}.*`, `${secureKey}[*]`, `*.${secureKey}`]
      }),
    )

    // eslint-disable-next-line
    const censors = redaction({ paths, censor }, false)

    // mapValues skips symbols keys so we'll use for..in
    for (let property in censors) {
      if (!isFunction(censors[property].restore)) {
        censors[property] = this.createTopCensor(property, censor)
      }
    }

    this.censors = censors
    this.wildcardCensor = censors[wildcardFirstSym]
  }

  censor(object) {
    this.traverseObject(object, (value, censor) => censor(value))

    return object
  }

  restore(object) {
    this.traverseObject(object, (value, censor) => censor.restore(value))

    return object
  }

  /** @private */
  createTopCensor(property, censor) {
    const { topCensors } = this

    if (property in topCensors) {
      const { censor } = topCensors[property]

      return censor
    }

    const topCensor = object => {
      const { valuesMap } = topCensors[property]
      const originalValue = object[property]

      valuesMap.set(object, originalValue)
      object[property] = censor
      return object
    }

    topCensor.restore = object => {
      const { valuesMap } = topCensors[property]

      object[property] = valuesMap.get(object)
      valuesMap.delete(object)

      return object
    }

    topCensors[property] = {
      censor: topCensor,
      valuesMap: new WeakMap(),
    }

    return topCensor
  }

  /** @private */
  traverseObject(object, iteratee) {
    if (!this.satisfiesRedactStrictMode(object)) {
      return
    }

    const { censors, wildcardCensor } = this
    const notHasOwnProperty = object.hasOwnProperty === undefined

    for (let property in object) {
      const value = object[property]

      if ((notHasOwnProperty || object.hasOwnProperty(property)) && value !== undefined) {
        if (property in censors) {
          iteratee(value, censors[property])
          continue
        }

        if (this.satisfiesRedactStrictMode(value)) {
          iteratee(value, wildcardCensor)
        }
      }
    }
  }

  /** @private */
  satisfiesRedactStrictMode(object) {
    return isObject(object) && !isNull(object)
  }
}
