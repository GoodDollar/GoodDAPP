import AsyncStorage from '@react-native-async-storage/async-storage'
import { isFunction } from 'lodash'
import { AB_TESTING, DESTINATION_PATH, INVITE_CODE, IS_FIRST_VISIT } from '../constants/localStorage'

export default new (class {
  constructor(storageApi) {
    this.storageApi = storageApi

    return new Proxy(this, {
      get: (target, property) => {
        const { storageApi } = target
        let propertyValue
        let propertyTarget = storageApi

        if (['get', 'set', 'clear'].some(prefix => property.startsWith(prefix))) {
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
    const toKeep = await this.storageApi.multiGet([IS_FIRST_VISIT, DESTINATION_PATH, AB_TESTING, INVITE_CODE])
    await this.storageApi.clear()
    this.storageApi.multiSet(toKeep.filter(_ => _[1] != null))
  }

  async setItem(key, value) {
    const stringified = JSON.stringify(value)

    await this.storageApi.setItem(key, stringified)
  }

  async getItem(key) {
    const jsonValue = await this.storageApi.getItem(key)

    if (jsonValue === null) {
      return null
    }

    try {
      return JSON.parse(jsonValue)
    } catch {
      return jsonValue
    }
  }
})(AsyncStorage)
