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
  jwt?: string
}

export type UserRecord = NameRecord &
  EmailRecord &
  MobileRecord &
  Credentials & {
    username?: string
  }

class API {
  jwt: string

  client: AxiosInstance

  constructor() {
    this.ready = this.init()
  }

  init() {
    log.info('initializing api...', Config.serverUrl)
    return AsyncStorage.getItem('GoodDAPP_jwt').then(async jwt => {
      this.jwt = jwt
      let instance: AxiosInstance = axios.create({
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

  addUser(user: UserRecord): AxiosPromise<any> {
    return this.client.post('/user/add', { user })
  }

  deleteAccount(zoomId: string): AxiosPromise<any> {
    return this.client.post('/user/delete', { zoomId })
  }

  sendOTP(user: UserRecord): AxiosPromise<any> {
    return this.client.post('/verify/sendotp', { user })
  }

  verifyUser(verificationData: any): AxiosPromise<any> {
    return this.client.post('/verify/user', { verificationData })
  }

  verifyMobile(verificationData: any): Promise<$AxiosXHR<any>> {
    return this.client.post('/verify/mobile', { verificationData })
  }

  verifyTopWallet(): Promise<$AxiosXHR<any>> {
    return this.client.post('/verify/topwallet')
  }

  sendVerificationEmail(user: UserRecord): Promise<$AxiosXHR<any>> {
    return this.client.post('/verify/sendemail', { user })
  }

  verifyEmail(verificationData: { code: string }): Promise<$AxiosXHR<any>> {
    return this.client.post('/verify/email', { verificationData })
  }

  sendLinkByEmail(to: string, sendLink: string): Promise<$AxiosXHR<any>> {
    return this.client.post('/send/linkemail', { to, sendLink })
  }

  sendRecoveryInstructionByEmail(mnemonic: string): Promise<$AxiosXHR<any>> {
    return this.client.post('/send/recoveryinstructions', { mnemonic })
  }

  sendLinkBySMS(to: string, sendLink: string): Promise<$AxiosXHR<any>> {
    return this.client.post('/send/linksms', { to, sendLink })
  }

  performFaceRecognition(req: FormData): Promise<$AxiosXHR<any>> {
    //return { data: { ok: 1, livenessPassed: true, duplicates: false, zoomEnrollmentId:-1 } } //TODO: // REMOVE!!!!!!!!!!
    return this.client
      .post('/verify/facerecognition', req, {
        headers: {
          'Content-Type': `multipart/form-data;`
        }
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
