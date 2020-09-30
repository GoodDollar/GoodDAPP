// @flow

import axios from 'axios'
import type { $AxiosXHR, AxiosInstance, AxiosPromise } from 'axios'
import { identity, isError, isPlainObject, isString, throttle } from 'lodash'

import AsyncStorage from '../utils/asyncStorage'
import Config from '../../config/config'
import { JWT } from '../constants/localStorage'
import logger from '../logger/pino-logger'
import type { NameRecord } from '../../components/signup/NameForm'
import type { EmailRecord } from '../../components/signup/EmailForm'
import type { MobileRecord } from '../../components/signup/PhoneForm'

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

export const getErrorMessage = apiError => {
  let message

  if (isString(apiError)) {
    message = apiError
  } else if (isError(apiError)) {
    message = apiError.message
  } else if (isPlainObject(apiError)) {
    message = apiError.error || apiError.message
  }

  if (!message) {
    message = 'Unexpected error happened during api call'
  }

  return message
}

/**
 * GoodServer Client.
 * This is being initialized with the token retrieved from GoodServer once.
 * After init is being used to user operations such add, delete, etc.
 */
export class APIService {
  jwt: string

  client: AxiosInstance

  mauticJS: any

  constructor(jwt = null) {
    this.init(jwt)
  }

  /**
   * init API with axions client and proper interptors. Needs `GoodDAPP_jwt`to be present in AsyncStorage
   */
  init(jwtToken = null) {
    const { serverUrl, apiTimeout, web3SiteUrl } = Config

    this.jwt = jwtToken
    log.info('initializing api...', serverUrl, jwtToken)

    return (this.ready = (async () => {
      let { jwt } = this

      if (!jwt) {
        jwt = await AsyncStorage.getItem(JWT)
        this.jwt = jwt
      }

      // eslint-disable-next-line require-await
      const exceptionHandler = async error => {
        let exception = error

        if (axios.isCancel(error)) {
          exception = new Error('Http request was cancelled during API call')
        }

        const { message, response } = exception
        const { data } = response || {}

        // Do something with response error
        log.warn('axios response error', message, exception)
        throw data || exception
      }

      let instance: AxiosInstance = axios.create({
        baseURL: serverUrl,
        timeout: apiTimeout,
        headers: { Authorization: `Bearer ${jwt || ''}` },
      })

      // eslint-disable-next-line require-await
      instance.interceptors.request.use(identity, async exception => {
        const { message } = exception

        // Do something with request error
        log.warn('axios req error', message, exception)
        throw exception
      })

      instance.interceptors.response.use(identity, exceptionHandler)

      this.client = await instance
      log.info('API ready', jwt)

      let w3Instance: AxiosInstance = axios.create({
        baseURL: web3SiteUrl,
        timeout: apiTimeout,
      })

      w3Instance.interceptors.response.use(({ data }) => data, exceptionHandler)

      this.w3Client = await w3Instance
      log.info('W3 client ready')
    })())
  }

  /**
   * `/auth/ping` get api call
   */
  ping(): AxiosPromise<any> {
    return this.client.get('/auth/ping')
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
  addUser = throttle((user: UserRecord): AxiosPromise<any> => {
    //-skipRegistrationStep ONLY FOR TESTING  delete this condition aftere testing
    return this.client.post(
      '/user/add',
      { user, skipRegistrationStep: global.skipRegistrationStep },
      { withCredentials: true }, //we need also the cookies for utm
    )
  }, 1000)

  /**
   * `/user/delete` post api call
   */
  deleteAccount(): AxiosPromise<any> {
    return this.client.post('/user/delete')
  }

  /**
   * `/user/exists` get api call
   */
  userExists(): AxiosPromise<any> {
    return this.client.get('/user/exists')
  }

  /**
   * `/w3Site/api/wl/user/update_profile` post w3 api call to delete wallet address
   * @param {string} token
   */
  deleteWalletFromW3Site(token): AxiosPromise<any> {
    this.w3Client.defaults.headers.common.Authorization = token

    return this.w3Client.put('/api/wl/user/update_profile', {
      wallet_address: null,
    })
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
   * `/send/magiclink` post api call
   * @param {string} magiclink
   */
  sendMagicLinkByEmail(magiclink: string): Promise<$AxiosXHR<any>> {
    return this.client.post('/send/magiclink', { magiclink })
  }

  /**
   * `/send/magiccode` post api call
   * @param {string} mobile
   * @param {string} magicCode
   */
  // sendMagicCodeBySms(mobile: string, magicCode: string): Promise<$AxiosXHR<any>> {
  //   return this.client.post('/send/magiccode', { to: mobile, magicCode })
  // }

  /**
   * `/send/linksms` post api call
   * @param {string} to
   * @param {string} sendLink
   */
  sendLinkBySMS(to: string, sendLink: string): Promise<$AxiosXHR<any>> {
    return this.client.post('/send/linksms', { to, sendLink })
  }

  /** @private */
  faceVerificationUrl = '/verify/face'

  /** @private */
  enrollmentUrl(enrollmentIdentifier) {
    const { faceVerificationUrl } = this

    return `${faceVerificationUrl}/${encodeURIComponent(enrollmentIdentifier)}`
  }

  /**
   * `/verify/face/session` post api call
   */
  issueSessionToken(): Promise<$AxiosXHR<any>> {
    const { client, faceVerificationUrl } = this

    return client.post(`${faceVerificationUrl}/session`, {})
  }

  /**
   * `/verify/face/:enrollmentIdentifier` put api call
   * @param {any} payload
   * @param {string} enrollmentIdentifier
   * @param {any} axiosConfig
   */
  performFaceVerification(payload: any, axiosConfig: any = {}): Promise<$AxiosXHR<any>> {
    const { client } = this
    const { enrollmentIdentifier, ...enrollmentPayload } = payload
    const endpoint = this.enrollmentUrl(enrollmentIdentifier)

    return client.put(endpoint, enrollmentPayload, axiosConfig)
  }

  /**
   * `/verify/face/:enrollmentIdentifier` delete api call
   * @param {string} enrollmentIdentifier
   * @param {string} signature
   */
  disposeFaceSnapshot(enrollmentIdentifier: string, signature: string): Promise<void> {
    const { client } = this
    const endpoint = this.enrollmentUrl(enrollmentIdentifier)

    return client.delete(endpoint, { params: { signature } })
  }

  /**
   * `/verify/face/:enrollmentIdentifier` get api call
   * @param {string} enrollmentIdentifier
   * @param {string} signature
   */
  checkFaceSnapshotDisposalState(enrollmentIdentifier: string): Promise<$AxiosXHR<any>> {
    const { client } = this
    const endpoint = this.enrollmentUrl(enrollmentIdentifier)

    return client.get(endpoint)
  }

  /**
   * `/storage/login/token` get api call
   */
  getLoginToken() {
    return this.client.get('/verify/w3/logintoken')
  }

  /**
   * `/w3Site/api/wl/user` get user from web3 by token
   * @param {string} token
   */
  getUserFromW3ByToken(token: string): Promise<$AxiosXHR<any>> {
    this.w3Client.defaults.headers.common.Authorization = token

    return this.w3Client.get('/api/wl/user')
  }

  /**
   * `/w3Site/api/wl/user` get user from web3 by token
   * @param {string} token
   * @param {string} walletAddress
   */
  updateW3UserWithWallet(token, walletAddress: string): Promise<$AxiosXHR<any>> {
    this.w3Client.defaults.headers.common.Authorization = token

    return this.w3Client.put('/api/wl/user/update_profile', {
      wallet_address: walletAddress,
    })
  }

  /**
   * `/verify/w3/email` verify if user not trying to send some different email than w3 provides
   * @param {object} data - Object with email and web3 token
   */
  checkWeb3Email(data: { email: string, token: string }): Promise<$AxiosXHR<any>> {
    return this.client.post('/verify/w3/email', data)
  }

  /**
   * Get array buffer from image url
   * @param {string} url - image url
   */
  getBase64FromImageUrl(url: string) {
    return axios.get(url, { responseType: 'arraybuffer' }).then(response => {
      let image = btoa(new Uint8Array(response.data).reduce((data, byte) => data + String.fromCharCode(byte), ''))

      return `data:${response.headers['content-type'].toLowerCase()};base64,${image}`
    })
  }

  /**
   * `/verify/w3/bonuses` get api call
   */
  redeemBonuses() {
    return this.client.get('/verify/w3/bonuses')
  }

  /**
   * `/trust` get api call
   */
  getTrust() {
    return this.client.get('/trust')
  }

  /**
   * `/user/enqueue` post api call
   * adds user to queue or return queue status
   */
  checkQueueStatus() {
    return this.client.post('/user/enqueue')
  }

  /**
   * adds a first time registering user to mautic
   * @param {*} userData usually just {email}
   */
  addMauticContact(userData: { email: string }) {
    const { email } = userData
    const { MauticJS } = global
    const { mauticAddContractFormID, mauticUrl } = Config

    if (!MauticJS || !mauticUrl || !email) {
      log.warn('addMauticContact not called:', {
        hasMauticAPI: !!MauticJS,
        mautic: mauticUrl,
        hasEmail: !!email,
      })

      return
    }

    const payload = {
      'mauticform[formId]': mauticAddContractFormID,
      'mauticform[email]': email,
      'mauticform[messenger]': 1,
    }

    MauticJS.makeCORSRequest(
      'POST',
      `${mauticUrl}/form/submit`,
      payload,
      () => log.info('addMauticContact success'),
      ({ content }, xhr) =>
        log.error('addMauticContact call failed:', '', new Error('Error received from Mautic API'), { content }),
    )
  }

  async getActualPhase() {
    const { data } = await this.client.get('/verify/phase')

    return data.phase
  }
}

const api = new APIService()

global.api = api
export default api
