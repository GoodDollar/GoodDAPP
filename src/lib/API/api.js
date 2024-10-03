// @flow

import axios from 'axios'
import { find, isArray, isString, shuffle } from 'lodash'

import type { $AxiosXHR, AxiosInstance, AxiosPromise } from 'axios'
import { padLeft } from 'web3-utils'

import Config, { fuseNetwork } from '../../config/config'

import { JWT } from '../constants/localStorage'
import AsyncStorage from '../utils/asyncStorage'

import { throttleAdapter } from '../utils/axios'
import { delay, fallback } from '../utils/async'
import { NETWORK_ID } from '../constants/network'
import { log, logNetworkError, requestErrorHandler, responseErrorHandler, responseHandler } from './utils'

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

    shared.interceptors.response.use(
      ({ data }) => data,
      error => {
        logNetworkError(error)
        throw error
      },
    )

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

      request.use(this.verifyJWT, requestErrorHandler)
      response.use(responseHandler, responseErrorHandler)

      this.client = instance
      log.info('API ready', jwt)
    })())
  }

  setLoginCallback(callback) {
    this.login = callback
  }

  // using arrow function so it is binded to this, when passed to axios
  verifyJWT = async config => {
    if (config.auth !== false) {
      //by default use auth
      const loginResult = this.login && (await this.login())
      const { jwt } = loginResult || this
      if (jwt) {
        config.headers.Authorization = 'Bearer ' + jwt
      }
    }
    return config
  }

  /**
   * `/auth/ping` get api call
   */
  ping(): AxiosPromise<any> {
    return this.client.get('/auth/ping', { throttle: false })
  }

  isWhitelisted(address): AxiosPromise<any> {
    return this.client.get(`/userWhitelisted/${encodeURIComponent(address)}`, { throttle: false })
  }

  syncWhitelist(address): AxiosPromise<any> {
    return this.client.get(`/syncWhitelist/${encodeURIComponent(address)}`, { throttle: false })
  }

  /**
   * `/auth/eth` post api call
   * @param {Credentials} creds
   */
  auth(creds: Credentials): AxiosPromise<any> {
    return this.client.post('/auth/eth', creds, { auth: false }) // auth false to prevent loop
  }

  fvAuth(creds: Credentials): AxiosPromise<any> {
    return this.client.post('/auth/fv2', creds, { auth: false }) // auth false to prevent loop
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

  // eslint-disable-next-line require-await
  async verifyCaptcha(payload: any): AxiosPromise<any> {
    const { sharedClient } = this
    const { env, verifyCaptchaUrl } = Config

    return sharedClient.post(`${verifyCaptchaUrl}/verify/recaptcha`, { ...payload, env })
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
  verifyTopWallet(chainId: number): Promise<$AxiosXHR<any>> {
    const throttle = { interval: 60000, trailing: false }

    return this.client.post('/verify/topwallet', { chainId }, { throttle })
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
  disposeFaceSnapshot(enrollmentIdentifier: string, fvSigner: string): Promise<void> {
    const { client } = this
    const endpoint = this.enrollmentUrl(enrollmentIdentifier)

    return client.delete(endpoint, { params: { fvSigner } })
  }

  /**
   * `/verify/face/:enrollmentIdentifier` get api call
   * @param {string} enrollmentIdentifier
   * @param {string} signature
   */
  checkFaceSnapshotDisposalState(enrollmentIdentifier: string, fvSigner: string): Promise<$AxiosXHR<any>> {
    const { client } = this
    const endpoint = this.enrollmentUrl(enrollmentIdentifier)

    return client.get(endpoint, { params: { fvSigner } })
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
  async invokeCallbackUrl(url, responseObject) {
    return this.sharedClient.post(url, responseObject)
  }

  // eslint-disable-next-line require-await
  async getTokenTxs(tokenAddress, address, chainId, fromBlock = null, allPages = true) {
    const explorerQuery = { action: 'tokentx', contractaddress: tokenAddress }

    return this.getExplorerTxs(address, chainId, explorerQuery, fromBlock, allPages).catch(e => {
      if (chainId !== NETWORK_ID.FUSE) {
        const tatumQuery = { tokenAddress, transactionTypes: 'fungible' }
        return this.getTatumTxs(address, chainId, tatumQuery, fromBlock, allPages)
      }

      throw e
    })
  }

  // eslint-disable-next-line require-await
  async getNativeTxs(address, chainId, fromBlock = null, allPages = true) {
    const explorerQuery = { action: 'txlist' }
    return this.getExplorerTxs(address, chainId, explorerQuery, fromBlock, allPages).catch(e => {
      if (chainId !== NETWORK_ID.FUSE) {
        const tatumQuery = { transactionTypes: 'native' }
        return this.getTatumTxs(address, chainId, tatumQuery, fromBlock, allPages)
      }

      throw e
    })
  }

  async getChains(): AxiosPromise<any> {
    const { explorer, explorerName, network_id: network } = fuseNetwork
    const chains = await this.sharedClient.get('/chains.json', {
      baseURL: Config.chainIdUrl,
    })

    const fuse = find(chains, { chainId: network })

    if (fuse && !fuse.explorers) {
      fuse.explorers = [
        {
          name: explorerName,
          url: explorer,
          standard: 'EIP3091',
        },
      ]
    }

    return chains
  }

  async getContractAbi(address, chainId, explorer = null): AxiosPromise<any> {
    switch (chainId) {
      case 122:
        explorer = fuseNetwork.explorerAPI
        break
      case 42220:
        explorer = Config.ethereum['42220'].explorerAPI
        break
      case 1:
        explorer = Config.ethereum['1'].explorerAPI
        break
      default:
        // eslint-disable-next-line no-lone-blocks
        {
          if (explorer.startsWith('https://api.') === false) {
            explorer = explorer.replace('https://', 'https://api.')
          }
        }
        break
    }
    if (!explorer) {
      return undefined
    }
    const params = {
      module: 'contract',
      action: 'getabi',
      address,
    }

    const apis = shuffle(explorer.split(',')).map(baseURL => async () => {
      const { result } = await this.sharedClient.get('/api', {
        params,
        baseURL,
      })

      let parsedResult = result
      if (isString(result)) {
        parsedResult = JSON.parse(result)
      }
      if (!isArray(parsedResult)) {
        log.warn('Failed to fetch contract ABI', { parsedResult, result, params, chainId, baseURL })
        throw new Error('Failed to fetch contract ABI')
      }

      return parsedResult
    })

    const result = await fallback(apis)

    return result
  }

  async getContractName(address, chainId, explorer = null): AxiosPromise<any> {
    const params = {
      module: 'contract',
      action: 'getsourcecode',
      address,
    }

    switch (chainId) {
      case 122:
        explorer = fuseNetwork.explorerAPI
        break
      case 42220:
        explorer = Config.ethereum['42220'].explorerAPI
        break
      case 1:
        explorer = Config.ethereum['1'].explorerAPI
        break
      default:
        break
    }

    if (!explorer) {
      return undefined
    }

    const apis = shuffle(explorer.split(',')).map(baseURL => async () => {
      const { result } = await this.sharedClient.get('/api', {
        params,
        baseURL,
      })

      if (!isArray(result)) {
        log.warn('Failed to fetch contract source', { result, params, chainId, baseURL })
        throw new Error('Failed to fetch contract source')
      }

      return result[0]
    })

    const res = await fallback(apis)

    // const { result } = await this.sharedClient.get('/api', {
    //   params,
    //   baseURL: explorer,
    // })

    const impl = chainId === 42220 ? res?.Implementation : res?.ImplementationAddress

    if (res?.Proxy === '1' || res?.IsProxy === 'true') {
      return this.getContractName(impl, chainId, explorer)
    }

    return res?.ContractName
  }

  // eslint-disable-next-line require-await
  async graphQuery(query): AxiosPromise<any> {
    const payload = { query }
    const options = { baseURL: Config.graphQlUrl }

    return this.sharedClient.post('', payload, options)
  }

  async getOTPLEvents(sender, chainId, address, from, currentBlock, eventHash) {
    const txs = []
    const explorer = Config.ethereum[chainId].explorerAPI

    const sender32 = padLeft(sender, 64)

    const fromBlock = chainId === 1 ? currentBlock - 500 : from

    const params = {
      module: 'logs',
      action: 'getLogs',
      address,
      sort: 'desc',
      page: 1,
      offset: 10000,
      topic0: eventHash,
      topic1: sender32,

      // required for fuse explorer, optional for celoscan
      topic0_1_opr: 'and',
      fromBlock: fromBlock,
      toBlock: currentBlock,
    }

    for (;;) {
      const apis = shuffle(explorer.split(',')).map(baseURL => async () => {
        const options = { baseURL, params }

        const { result: events } = await this.sharedClient.get('/api', options)

        if (!isArray(events)) {
          log.warn('Failed to fetch OTP events from explorer', { events, params, chainId, baseURL })
          throw new Error('Failed to fetch OTP events from explorer')
        }

        return events
      })

      // eslint-disable-next-line no-await-in-loop
      const events = await fallback(apis)

      // const { result: events } = await this.sharedClient.get('/api', {
      //   params,
      //   baseURL: explorer,
      // })

      params.page += 1

      txs.push(...events)

      if (events.length < params.offset) {
        // default page size by explorer.fuse.io
        break
      }
    }

    return txs
  }

  /**
   * @private
   */
  async getTatumTxs(address, chainId, query = {}, from = null, allPages = true): Promise<any[]> {
    const url = '/data/transactions'
    const { CELO, MAINNET, GOERLI } = NETWORK_ID

    let chain
    const txs = []

    switch (chainId) {
      case MAINNET:
        chain = 'ethereum'
        break
      case GOERLI:
        chain = 'ethereum-goerli'
        break
      case CELO:
        chain = 'celo'
        break

      // FUSE not supported on Tatum
      default:
        throw new Error('Chain not supported')
    }

    const pageSize = 50 // default page size by Tatum
    const params = { ...query, chain, addresses: address, offset: 0 }

    const options = {
      baseURL: Config.tatumApiUrl,
      params,
      headers: { accept: 'application/json', 'x-api-key': Config.tatumApiKey },
    }

    if (from) {
      params.blockFrom = from
    }

    for (;;) {
      const { result } = await this.sharedClient // eslint-disable-line no-await-in-loop
        .get(url, options)

      params.offset += 1
      const chunk = result.filter(({ transactionSubtype }) => transactionSubtype !== 'zero-transfer')
      txs.push(...chunk)

      if (allPages === false || result.length < pageSize) {
        break
      }
      // eslint-disable-next-line no-await-in-loop
      await delay(500) // wait 500ms before next call to prevent rate limits
    }

    return txs
  }

  async getExplorerTxs(address, chainId, query, from = null, allPages = true) {
    const txs = []
    const url = '/api'
    const explorer = Config.ethereum[chainId]?.explorerAPI

    const params = { ...query, module: 'account', address, sort: 'asc', page: 1, offset: 10000 }

    if (from) {
      params.start_block = from
      params.startblock = from //etherscan
    }

    for (;;) {
      const apis = shuffle(explorer.split(',')).map(baseURL => async () => {
        const options = { baseURL, params }

        const { result } = await this.sharedClient.get(url, options)

        if (!isArray(result)) {
          log.warn('Failed to fetch transactions from explorer', { result, params, chainId, baseURL })
          throw new Error('Failed to fetch transactions from explorer')
        }
        return result
      })

      // eslint-disable-next-line no-await-in-loop
      const result = await fallback(apis)

      const chunk = result.filter(({ value }) => value !== '0')

      params.page += 1

      txs.push(...chunk)

      if (allPages === false || result.length < params.offset) {
        // default page size by explorer.fuse.io
        break
      }
    }

    return txs
  }
}

const api = new APIService()

global.api = api
export default api
