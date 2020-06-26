import { AsyncStorage } from 'react-native'

export default new class {
  constructor(storageApi) {
    this.storageApi = storageApi
  }

  async setItem(key, value) {
    try {
      const stringified = JSON.stringify(value)
      await this.storageApi.setItem(key, stringified)
    } catch (err) {
      return err
    }
  }

  async getItem(key) {
    try {
      const jsonValue = await this.storageApi.getItem(key)
      if (jsonValue !== null) {
        return JSON.parse(jsonValue)
      }

      return null
    } catch (err) {
      return err
    }
  }

  async removeItem(key) {
    try {
      await this.storageApi.removeItem(key)
    } catch (err) {
      return err
    }
  }

  async clear() {
    try {
      await this.storageApi.clear()
    } catch (err) {
      return Error
    }
  }
}(AsyncStorage)
