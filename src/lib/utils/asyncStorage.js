import AsyncStorage from '@react-native-async-storage/async-storage'
import { isFunction } from 'lodash'

import { AB_TESTING, DESTINATION_PATH, INVITE_CODE, IS_FIRST_VISIT } from '../constants/localStorage'
import logger from '../logger/js-logger'

const backupProps = [IS_FIRST_VISIT, DESTINATION_PATH, AB_TESTING, INVITE_CODE]
const log = logger.child({ from: 'AsyncStorage' })

export default new class {
  constructor(storageApi) {
    this.storageApi = storageApi

    return new Proxy(this, {
      get: (target, property) => {
        const { storageApi } = target
        let propertyValue
        let propertyTarget = storageApi

        // override methods clear, getItem, setItem, multiGet, multiSet
        if ('clear' === property || property.match(/(get|set)/i)) {
          propertyTarget = this
        }

        propertyValue = propertyTarget[property]

        if (isFunction(propertyValue)) {
          propertyValue = propertyValue.bind(propertyTarget)
        }

        return propertyValue
      },
    })
  }

  async clear() {
    let backup = []

    try {
      const pairs = await this.multiGet(backupProps)

      backup = pairs.filter(([, value]) => value !== null)
    } catch (e) {
      log.warn('Error backing up AsyncStorage before cleanup:', e.message, e)
    }

    await this.storageApi.clear()

    try {
      await this.multiSet(backup)
    } catch (e) {
      log.warn('Error restoring AsyncStorage after cleanup:', e.message, e)
    }
  }

  async setItem(key, value) {
    const stringified = JSON.stringify(value)

    await this.storageApi.setItem(key, stringified)
  }

  async getItem(key) {
    const jsonValue = await this.storageApi.getItem(key)

    return this._parseValue(jsonValue)
  }

  async multiSet(keyValuePairs) {
    const stringifiedPairs = keyValuePairs.map(([key, value]) => [key, JSON.stringify(value)])

    await this.storageApi.multiSet(stringifiedPairs)
  }

  async multiGet(keys) {
    const keyJsonValuePairs = await this.storageApi.multiGet(keys)

    return keyJsonValuePairs.map(([key, jsonValue]) => [key, this._parseValue(jsonValue)])
  }

  _parseValue(jsonValue) {
    if (jsonValue === null) {
      return null
    }

    try {
      return JSON.parse(jsonValue)
    } catch {
      return jsonValue
    }
  }
}(AsyncStorage)
