// @flow
import axios from 'axios'
import Config from '../../config/config'
import { AsyncStorage } from 'react-native'
import logger from '../logger/pino-logger'

const log = logger.child({ from: 'API' })

export type Credentials = {
  publicKey: string,
  signature: string,
  jwt?: string
}

export type UserRecord = {
  pubkey: string,
  fullName?: string,
  mobile?: string,
  email?: string,
  jwt?: string
}

class API {
  jwt: string
  client: axios

  constructor() {
    this.init()
  }

  init() {
    log.info('initializing api...')
    AsyncStorage.getItem('GoodDAPP_jwt').then(async jwt => {
      this.jwt = jwt
      this.client = await axios.create({
        baseURL: Config.GoodServer,
        timeout: 10000,
        headers: { Authorization: `Bearer ${this.jwt || ''}` }
      })
      log.info('API ready', this.client, this.jwt)
    })
  }
  auth(creds: Credentials) {
    return this.client.post(`/auth/eth`, creds)
  }

  async addUser(user: UserRecord) {
    try {
      let res = await this.client.post('/user/add', { user })
      log.info(res)
    } catch (e) {
      log.error(e)
    }
  }

  async verifyUser(verificationData: any) {
    try {
      let res = await this.client.post('/verify/user', { verificationData })
      log.info(res)
    } catch (e) {
      log.error(e)
      throw e
    }
  }
}

export default new API()
