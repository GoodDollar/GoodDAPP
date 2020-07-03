import AsyncStorage from '@react-native-community/async-storage'
import { isFunction } from 'lodash'

export default new class {
  constructor(storageApi) {
    this.storageApi = storageApi

    return new Proxy(this, {
      get: (target, property) => {
        const { storageApi } = target
        let propertyValue
        let propertyTarget = storageApi

        if (['get', 'set'].some(prefix => property.startsWith(prefix))) {
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
      return
    }
  }
}(AsyncStorage)
