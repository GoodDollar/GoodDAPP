// @flow

import axios from 'axios'
import type { $AxiosXHR, AxiosInstance, AxiosPromise } from 'axios'
import { get, identity, isError, isObject, isString } from 'lodash'

import { throttleAdapter } from '../utils/axios'
import AsyncStorage from '../utils/asyncStorage'
import Config from '../../config/config'
import { JWT } from '../constants/localStorage'
import logger from '../logger/js-logger'

import type { NameRecord } from '../../components/signup/NameForm'
import type { EmailRecord } from '../../components/signup/EmailForm'
import type { MobileRecord } from '../../components/signup/PhoneForm'

const log = logger.child({ from: 'API' })

export type Credentials = {
  signature?: string, //signed with address used to login to the system
  gdSignature?: string, //signed with address of user wallet holding G$
  profileSignature?: string, //signed with address of user profile
  profilePublickey?: string, //public key used for storing user profile
  nonce?: string,
  jwt?: string,
}

export type UserRecord = NameRecord &
  EmailRecord &
  MobileRecord &
  Credentials & {
    username?: string,
  }

export const defaultErrorMessage = 'Unexpected error happened during api call'

export const getErrorMessage = apiError => {
  let errorMessage

  if (isString(apiError)) {
    errorMessage = apiError
  } else if (isObject(apiError)) {
    // checking all cases:
    // a) JS Error - will have .message property
    // b) { ok: 0, message: 'Error message' } shape
    // c) { ok: 0, error: 'Error message' } shape
    const { message, error } = apiError

    errorMessage = message || error
  }

  if (!errorMessage) {
    errorMessage = defaultErrorMessage
  }

  return errorMessage
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
    const { serverUrl, apiTimeout } = Config

    this.jwt = jwtToken

    return (this.ready = (async () => {
      let { jwt } = this

      if (!jwt) {
        jwt = await AsyncStorage.getItem(JWT)
        this.jwt = jwt
      }
      log.info('initializing api...', serverUrl, jwt)

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
        adapter: throttleAdapter(1000),
      })

      // eslint-disable-next-line require-await
      instance.interceptors.request.use(identity, async exception => {
        const { message } = exception

        // Do something with request error
        log.warn('axios req error', message, exception)
        throw exception
      })

      instance.interceptors.response.use(identity, exceptionHandler)

      this.client = instance
      log.info('API ready', jwt)
    })())
  }

  /**
   * `/auth/ping` get api call
   */
  ping(): AxiosPromise<any> {
    return this.client.get('/auth/ping', { throttle: false })
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
   * `/user/start` post api call
   * @param {UserRecord} user
   */
  addSignupContact(user: UserRecord): AxiosPromise<any> {
    return this.client.post('/user/start', { user })
  }

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
   * `/user/exists` get api call
   */
  userExistsCheck(searchBy: { email: string, mobile: string, identifier: string }): AxiosPromise<any> {
    return this.client.post('/userExists', searchBy, { throttle: false })
  }

  /**
   * `/verify/sendotp` post api call
   * @param {UserRecord} user
   */
  sendOTP(user: UserRecord, onlyCheckAlreadyVerified: boolean = false): AxiosPromise<any> {
    return this.client.post('/verify/sendotp', { user, onlyCheckAlreadyVerified })
  }

  /**
   * `/verify/user` post api call
   * @param {any} verificationData
   */
  verifyUser(verificationData: any): AxiosPromise<any> {
    return this.client.post('/verify/user', { verificationData })
  }

  async verifyCaptcha(token: string): AxiosPromise<any> {
    const { client } = this
    const payload = { token }

    try {
      const ipv6Response = await client.get('https://api64.ipify.org/?format=json')
      const ip = get(ipv6Response, 'data.ip', '')

      if (!ip.includes(':')) {
        throw new Error("Client's ISP doesn't supports IPv6.")
      }

      payload.ipv6 = ip
    } catch (errorOrStatus) {
      let exception = errorOrStatus

      if (!isError(errorOrStatus)) {
        exception = new Error(isString(errorOrStatus) ? errorOrStatus : 'Http exception during Ipify API call')
      }

      log.warn('Failed to determine client IPv6:', exception.message, exception)
    }

    return client.post('/verify/recaptcha', payload)
  }

  /**
   * `ip-api.com/json` get location api call
   */
  getLocation(): AxiosPromise<any> {
    return axios.get('https://get.geojs.io/v1/ip/country.json', { throttle: false })
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

  /** @private */
  faceVerificationUrl = '/verify/face'

  /** @private */
  enrollmentUrl(enrollmentIdentifier) {
    const { faceVerificationUrl } = this

    return `${faceVerificationUrl}/${encodeURIComponent(enrollmentIdentifier)}`
  }

  /**
   * `/verify/face/license/:licenseType` post api call
   */
  getLicenseKey(licenseType: string): Promise<$AxiosXHR<any>> {
    const { client, faceVerificationUrl } = this

    return client.post(`${faceVerificationUrl}/license/${encodeURIComponent(licenseType)}`, {})
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
  performFaceVerification(enrollmentIdentifier: string, payload: any, axiosConfig: any = {}): Promise<$AxiosXHR<any>> {
    const { client } = this
    const endpoint = this.enrollmentUrl(enrollmentIdentifier)

    return client.put(endpoint, payload, axiosConfig)
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
   * `/trust` get api call
   */
  getTrust() {
    return this.client.get('/trust', { throttle: false })
  }

  /**
   * `/profileBy` get api call
   */
  getProfileBy(valueHash: string) {
    return this.client.get('/profileBy', { params: { valueHash }, throttle: false })
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

  // eslint-disable-next-line require-await
  async notifyVendor(transactionId, transactionInfo) {
    const { callbackUrl, invoiceId, senderEmail, senderName } = transactionInfo || {}

    if (!callbackUrl) {
      return // or throw error
    }

    return this.client.post(callbackUrl, { invoiceId, transactionId, senderEmail, senderName })
  }
}

const api = new APIService()

global.api = api
export default api
