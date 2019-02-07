// @flow
import axios from 'axios'
import type { Axios, AxiosPromise } from 'axios'
import Config from '../../config/config'
import { AsyncStorage } from 'react-native'
import logger from '../logger/pino-logger'
import type { NameRecord } from '../../components/signup/NameForm'
import type { EmailRecord } from '../../components/signup/EmailForm'
import type { MobileRecord } from '../../components/signup/PhoneForm.web'

const log = logger.child({ from: 'API' })

export type Credentials = {
  pubkey: string,
  signature?: string,
  jwt: string
}

export type UserRecord = NameRecord & EmailRecord & MobileRecord & Credentials

class API {
  jwt: string
  client: Axios

  constructor() {
    this.init()
  }

  init() {
    log.info('initializing api...')
    AsyncStorage.getItem('GoodDAPP_jwt').then(async jwt => {
      this.jwt = jwt
      this.client = await axios.create({
        baseURL: Config.GoodServer,
        timeout: 30000,
        headers: { Authorization: `Bearer ${this.jwt || ''}` }
      })
      log.info('API ready', this.client, this.jwt)
    })
  }

  auth(creds: Credentials): AxiosPromise<any> {
    return this.client.post('/auth/eth', creds).then(this.init())
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
