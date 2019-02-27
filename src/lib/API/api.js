// @flow
import axios from 'axios'
import type { Axios, AxiosPromise, $AxiosXHR } from 'axios'
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
      let instance = axios.create({
        baseURL: Config.serverUrl,
        timeout: 30000,
        headers: { Authorization: `Bearer ${this.jwt || ''}` }
      })
      instance.interceptors.request.use(
        req => {
          return req
        },
        error => {
          // Do something with response error
          log.error('axios req error', { error })
          return Promise.reject(error)
        }
      )
      instance.interceptors.response.use(
        response => {
          return response
        },
        error => {
          // Do something with response error
          log.error('axios response error', { error })
          return Promise.reject(error)
        }
      )
      this.client = await instance
      log.info('API ready', this.jwt)
    })
  }

  auth(creds: Credentials): AxiosPromise<any> {
    return this.client.post('/auth/eth', creds)
  }

  async addUser(user: UserRecord) {
    try {
      let res = await this.client.post('/user/add', { user })
      log.info(res)
    } catch (e) {
      log.error(e)
    }
  }

  async sendOTP(user: UserRecord) {
    try {
      const res = await this.client.post('/verify/sendotp', { user })
      log.info(res)
    } catch (e) {
      log.error(e)
      throw e
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

  async verifyMobile(verificationData: any): Promise<$AxiosXHR<any>> {
    return this.client.post('/verify/mobile', { verificationData })
  }

  async verifyTopWallet(): Promise<$AxiosXHR<any>> {
    return this.client.post('/verify/topwallet')
  }
}

export default new API()
