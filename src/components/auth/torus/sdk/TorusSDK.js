import { bindAll, defaults, first, omit, padStart, repeat, values } from 'lodash'

import Config from '../../../../config/config'
import logger from '../../../../lib/logger/js-logger'
import Torus from './torus'

import {
  Auth0Strategy,
  FacebookStrategy,
  GoogleLegacyStrategy,
  GoogleStrategy,
  PaswordlessEmailStrategy,
  PaswordlessSMSStrategy,
} from './strategies'

export const TorusStatusCode = {
  UserCancel: 'UserCancelledException',
  BrowserNotAllowed: 'NoAllowedBrowserFoundException',
}

class TorusSDK {
  strategies = {}

  static factory(options) {
    const sdk = new TorusSDK(Config, options, logger.child({ from: 'TorusSDK' }))

    sdk.addStrategy('facebook', FacebookStrategy)
    sdk.addStrategy('google-old', GoogleLegacyStrategy)
    sdk.addStrategy('google', GoogleStrategy)
    sdk.addStrategy('auth0', Auth0Strategy)
    sdk.addStrategy('auth0-pwdless-email', PaswordlessEmailStrategy)
    sdk.addStrategy('auth0-pwdless-sms', PaswordlessSMSStrategy)

    return sdk
  }

  constructor(config, options, logger) {
    const { env, torusNetwork, torusUxMode = 'popup' } = config

    const torusOptions = defaults({}, options, {
      network: torusNetwork, // details for test net
      enableLogging: env === 'development',
      uxMode: torusUxMode,
    })

    // Temporary fix for ropsten deprecation
    if (torusOptions.network === 'testnet') {
      torusOptions.networkUrl =
        'https://billowing-responsive-arm.ropsten.discover.quiknode.pro/e1f91ad991da6c4a3558e1d2450238ea1fe17af1/'
    }

    this.torus = new Torus(config, torusOptions)
    this.popupMode = torusOptions.uxMode === 'popup'
    this.config = config
    this.logger = logger

    bindAll(this, '_fetchStatusCode')
  }

  // eslint-disable-next-line require-await
  async initialize() {
    return this.torus.init({ skipInit: !this.popupMode })
  }

  async getRedirectResult() {
    const { torus, _fetchStatusCode } = this
    const { result } = await torus.getRedirectResult().catch(_fetchStatusCode)

    return this.fetchTorusUser(result)
  }

  async triggerLogin(verifier, customLogger = null) {
    const { logger, strategies, _fetchStatusCode } = this
    const log = customLogger || logger
    let withVerifier = verifier

    log.debug('triggerLogin', { verifier })

    if (!verifier || !(verifier in strategies)) {
      withVerifier = 'facebook'
    }

    const strategy = strategies[withVerifier]
    const response = await strategy.triggerLogin().catch(_fetchStatusCode)

    // no response in case of redirect flow
    if (!this.popupMode) {
      return response
    }

    return this.fetchTorusUser(response, customLogger)
  }

  addStrategy(verifier, strategyClass) {
    const { config, torus, strategies } = this

    strategies[verifier] = new strategyClass(torus, config)
  }

  fetchTorusUser(response, customLogger = null) {
    const { logger, config } = this
    const log = customLogger || logger

    let torusUser = response
    let { userInfo, ...otherResponse } = torusUser

    if (userInfo) {
      // aggregate login returns an array with user info
      userInfo = first(userInfo) || userInfo
      torusUser = { ...otherResponse, ...userInfo }
    }

    let { name, email, privateKey = '' } = torusUser
    const isLoginPhoneNumber = /\+[0-9]+$/.test(name)

    if (isLoginPhoneNumber) {
      torusUser = { ...torusUser, mobile: name }
    }

    if (isLoginPhoneNumber || name === email) {
      torusUser = omit(torusUser, 'name')
    }

    if (privateKey) {
      const leading = privateKey.length - 64

      const failWithInvalidKey = () => {
        log.warn('Invalid private key received', privateKey)
        throw new Error('Invalid private key received: ' + privateKey)
      }

      if (!/^[0-9a-f]+$/i.test(privateKey)) {
        failWithInvalidKey()
      }

      if (leading > 0) {
        // leading characters should be zeros, otherwise something went wrong
        if (privateKey.substring(0, leading) !== repeat('0', leading)) {
          failWithInvalidKey()
        }

        log.warn('Received private key with extra "0" padding:', privateKey)
        privateKey = privateKey.substring(leading)
      }

      if (leading < 0) {
        log.warn('Private key must be 32 bytes long, adding extra "0" padding:', privateKey)
        privateKey = padStart(privateKey, 64, '0')
      }

      if (leading !== 0) {
        torusUser = { ...torusUser, privateKey }
      }
    }

    if ('production' !== config.env) {
      log.debug('Received torusUser:', torusUser)
    }

    return torusUser
  }

  /** @private */
  _fetchStatusCode(exception) {
    const { message } = exception

    values(TorusStatusCode).some(code => {
      const matches = message.includes(code)

      if (matches) {
        exception.name = code
      }

      return matches
    })

    throw exception
  }
}

export default TorusSDK
