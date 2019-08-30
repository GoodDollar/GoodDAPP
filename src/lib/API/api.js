// @flow
import axios from 'axios'
import type { $AxiosXHR, AxiosInstance, AxiosPromise } from 'axios'
import { AsyncStorage } from 'react-native'
import Config from '../../config/config'
import logger from '../logger/pino-logger'
import type { NameRecord } from '../../components/signup/NameForm'
import type { EmailRecord } from '../../components/signup/EmailForm'
import type { MobileRecord } from '../../components/signup/PhoneForm.web'

const log = logger.child({ from: 'API' })

export type Credentials = {
  signature?: string, //signed with address used to login to the system
  gdSignature?: string, //signed with address of user wallet holding G$
  profileSignature?: string, //signed with address of user profile on GunDB
  profilePublickey?: string, //public key of user profile on gundb
  nonce?: string,
  jwt?: string,
}

export type UserRecord = NameRecord &
  EmailRecord &
  MobileRecord &
  Credentials & {
    username?: string,
  }

/**
 * GoodServer Client.
 * This is being initialized with the token retrieved from GoodServer once.
 * After init is being used to user operations such add, delete, etc.
 */
class API {
  jwt: string

  client: AxiosInstance

  constructor() {
    this.ready = this.init()
  }

  /**
   * init API with axions client and proper interptors. Needs `GoodDAPP_jwt`to be present in AsyncStorage
   */
  init() {
    log.info('initializing api...', Config.serverUrl)
    return (this.ready = AsyncStorage.getItem('GoodDAPP_jwt').then(async jwt => {
      this.jwt = jwt
      let instance: AxiosInstance = axios.create({
        baseURL: Config.serverUrl,
        timeout: 30000,
        headers: { Authorization: `Bearer ${this.jwt || ''}` },
      })
      instance.interceptors.request.use(
        req => {
          return req
        },
        e => {
          // Do something with response error
          log.error('axios req error', e.message, e)
          return Promise.reject(e)
        }
      )
      instance.interceptors.response.use(
        response => {
          return response
        },
        e => {
          // Do something with response error
          log.error('axios response error', e.message, e)
          if (e.response.data) {
            return Promise.reject(e.response.data)
          }
          return Promise.reject(e)
        }
      )
      this.client = await instance
      log.info('API ready', this.jwt)
    }))
  }

  /**
   * `/auth/eth` post api call
   * @param {Credentials} creds
   */
  auth(creds: Credentials): AxiosPromise<any> {
    return this.client.post('/auth/eth', creds)
  }

  /**
   * `/user/add` post api call
   * @param {UserRecord} user
   */
  addUser(user: UserRecord): AxiosPromise<any> {
    return this.client.post('/user/add', { user })
  }

  /**
   * `/user/delete` post api call
   * @param {string} zoomId
   */
  deleteAccount(zoomId: string): AxiosPromise<any> {
    return this.client.post('/user/delete', { zoomId })
  }

  /**
   * `/verify/sendotp` post api call
   * @param {UserRecord} user
   */
  sendOTP(user: UserRecord): AxiosPromise<any> {
    return this.client.post('/verify/sendotp', { user })
  }

  /**
   * `/verify/user` post api call
   * @param {any} verificationData
   */
  verifyUser(verificationData: any): AxiosPromise<any> {
    return this.client.post('/verify/user', { verificationData })
  }

  /**
   * `ip-api.com/json` get location api call
   */
  getLocation(): AxiosPromise<any> {
    return axios.get('https://get.geojs.io/v1/ip/country.json')
  }

  /**
   * `/verify/mobile` post api call
   * @param {any} verificationData
   */
  verifyMobile(verificationData: any): Promise<$AxiosXHR<any>> {
    return this.client.post('/verify/mobile', { verificationData })
  }

  /**
   * `/verify/topwallet` post api call. Tops users wallet
   */
  verifyTopWallet(): Promise<$AxiosXHR<any>> {
    return this.client.post('/verify/topwallet')
  }

  /**
   * `/verify/sendemail` post api call
   * @param {UserRecord} user
   */
  sendVerificationEmail(user: UserRecord): Promise<$AxiosXHR<any>> {
    return this.client.post('/verify/sendemail', { user })
  }

  /**
   * `/verify/email` post api call
   * @param {object} verificationData
   * @param {string} verificationData.code
   */
  verifyEmail(verificationData: { code: string }): Promise<$AxiosXHR<any>> {
    return this.client.post('/verify/email', { verificationData })
  }

  /**
   * `/send/linkemail` post api call
   * @param {string} creds
   * @param {string} sendLink
   */
  sendLinkByEmail(to: string, sendLink: string): Promise<$AxiosXHR<any>> {
    return this.client.post('/send/linkemail', { to, sendLink })
  }

  /**
   * `/send/recoveryinstructions` post api call
   * @param {string} mnemonic
   */
  sendRecoveryInstructionByEmail(mnemonic: string): Promise<$AxiosXHR<any>> {
    return this.client.post('/send/recoveryinstructions', { mnemonic })
  }

  /**
   * `/send/linksms` post api call
   * @param {string} to
   * @param {string} sendLink
   */
  sendLinkBySMS(to: string, sendLink: string): Promise<$AxiosXHR<any>> {
    return this.client.post('/send/linksms', { to, sendLink })
  }

  /**
   * `/verify/facerecognition` post api call
   * @param {Credentials} creds
   */
  performFaceRecognition(req: FormData): Promise<$AxiosXHR<any>> {
    //return { data: { ok: 1, livenessPassed: true, duplicates: false, zoomEnrollmentId:-1 } } //TODO: // REMOVE!!!!!!!!!!
    return this.client
      .post('/verify/facerecognition', req, {
        headers: {
          'Content-Type': `multipart/form-data;`,
        },
      })
      .then(r => {
        if (r.data.onlyInEnv) {
          return { data: { ok: 1, enrollResult: { alreadyEnrolled: true } } }
        }
        return r
      })
  }
}
const api = new API()
global.api = api
export default api
