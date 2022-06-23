// @flow

import axios from 'axios'
import { get, identity, isError, isString } from 'lodash'

import type { $AxiosXHR, AxiosInstance, AxiosPromise } from 'axios'
import Config from '../../config/config'

import { JWT } from '../constants/localStorage'
import AsyncStorage from '../utils/asyncStorage'

import { throttleAdapter } from '../utils/axios'
import { fallback } from '../utils/async'
import { log, requestErrorHandler, responseErrorHandler, responseHandler } from './utils'

import type { Credentials, UserRecord } from './utils'

/**
 * GoodServer Client.
 * This is being initialized with the token retrieved from GoodServer once.
 * After init is being used to user operations such add, delete, etc.
 */
export class APIService {
  jwt: string

  client: AxiosInstance

  sharedClient: AxiosInstance

  constructor(jwt = null) {
    const shared = axios.create()

    shared.interceptors.response.use(({ data }) => data)

    this.sharedClient = shared
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

      let instance: AxiosInstance = axios.create({
        baseURL: serverUrl,
        timeout: apiTimeout,
        headers: { Authorization: `Bearer ${jwt || ''}` },
        adapter: throttleAdapter(1000),
      })

      const { request, response } = instance.interceptors

      request.use(identity, requestErrorHandler)
      response.use(responseHandler, responseErrorHandler)

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

  fvauth(creds: Credentials): AxiosPromise<any> {
    return this.client.post('/auth/fv', creds)
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

  updateClaims(claimData: { claim_counter: number, last_claim: string }): AxiosPromise<any> {
    return this.client.post('/user/claim', { ...claimData })
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

  /**
   * `/user/verifyCRM` post api call
   * @param {any} profile - user email/mobile/name to be added to CRM if doesnt exists
   */
  verifyCRM(profile): AxiosPromise<any> {
    return this.client.post('/user/verifyCRM', { user: profile })
  }

  async verifyCaptcha(token: string): AxiosPromise<any> {
    const { client, sharedClient } = this
    const payload = { token }

    const requestCloudflare = async () => {
      const trace = await sharedClient.get('https://www.cloudflare.com/cdn-cgi/trace')
      const [, address] = /ip=(.+?)\n/.exec(trace || '') || []

      log.info('CF response', { trace })

      return address
    }

    const requestIpify = async () => {
      const ipv6Response = await sharedClient.get('https://api64.ipify.org/?format=json')

      log.info('Ipify response', { ipv6Response })
      return get(ipv6Response, 'ip', '')
    }

    const withValidation = requestIP =>
      requestIP().then(address => {
        if (!address) {
          throw new Error('Empty IP has been returned.')
        }

        if (!address.includes(':')) {
          throw new Error("Client's ISP doesn't supports IPv6.")
        }

        return address
      })

    try {
      const ip = await fallback([requestCloudflare, requestIpify].map(withValidation))

      log.info('ip for captcha:', { ip })
      payload.ipv6 = ip
    } catch (errorOrStatus) {
      let exception = errorOrStatus

      if (!isError(errorOrStatus)) {
        exception = new Error(
          isString(errorOrStatus) ? errorOrStatus : 'Unexpected exception while getting IPv6 address',
        )
      }

      log.warn('Failed to determine client IPv6:', exception.message, exception)
    }

    return client.post('/verify/recaptcha', payload)
  }

  /**
   * `ip-api.com/json` get location api call
   */
  getLocation(): AxiosPromise<any> {
    return this.sharedClient.get('https://get.geojs.io/v1/ip/country.json')
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
    const throttle = { interval: 60000, trailing: false }

    return this.client.post('/verify/topwallet', {}, { throttle })
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

  // eslint-disable-next-line require-await
  async getMessageStrings() {
    return this.client.get('/strings')
  }

  // eslint-disable-next-line require-await
  async sendLoginVendorDetails(url, responseObject) {
    return this.sharedClient.post(url, responseObject)
  }
}

const api = new APIService()

global.api = api
export default api
