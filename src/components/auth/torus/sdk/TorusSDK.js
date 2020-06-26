import DirectWebSDK from '@toruslabs/torus-direct-web-sdk'
import { first, omit } from 'lodash'

import Config from '../../../../config/config'
import logger from '../../../../lib/logger/pino-logger'

import {
  Auth0Strategy,
  FacebookStrategy,
  GoogleLegacyStrategy,
  GoogleStrategy,
  PaswordlessEmailStrategy,
  PaswordlessSMSStrategy,
} from './strategies'

class TorusSDK {
  strategies = {}

  constructor(config, logger) {
    const { env, publicUrl, googleClientId, facebookAppId } = config

    this.torus = new DirectWebSDK({
      GOOGLE_CLIENT_ID: googleClientId,
      FACEBOOK_CLIENT_ID: facebookAppId,
      proxyContractAddress: '0x4023d2a0D330bF11426B12C6144Cfb96B7fa6183', // details for test net
      network: 'ropsten', // details for test net
      baseUrl: `${publicUrl}/torus/`,
      enableLogging: env === 'development',
    })

    this.config = config
    this.logger = logger
  }

  // eslint-disable-next-line require-await
  async initialize() {
    const { torus } = this

    return torus.init()
  }

  async triggerLogin(verifier, customLogger = null) {
    const { logger, strategies, fetchTorusUser } = this
    const log = customLogger || logger
    let withVerifier = verifier

    log.debug('triggerLogin', { verifier })

    if (!verifier || !(verifier in strategies)) {
      withVerifier = 'facebook'
    }

    const response = await strategies[withVerifier].triggerLogin()

    return fetchTorusUser(response)
  }

  addStrategy(verifier, strategyClass) {
    const { config, torus, strategies } = this

    strategies[verifier] = new strategyClass(torus, config)
  }

  fetchTorusUser(response) {
    const { env } = this.config

    let torusUser = response
    let { userInfo, ...otherResponse } = torusUser

    if (userInfo) {
      // aggregate login returns an array with user info
      userInfo = first(userInfo) || userInfo
      torusUser = { ...otherResponse, ...userInfo }
    }

    const { name, email } = torusUser
    const isLoginPhoneNumber = /\+[0-9]+$/.test(name)

    if (isLoginPhoneNumber) {
      torusUser = { ...torusUser, mobile: name }
    }

    if (isLoginPhoneNumber || name === email) {
      torusUser = omit(torusUser, 'name')
    }

    if ('production' !== env) {
      logger.debug('Receiver torusUser:', torusUser)
    }

    return torusUser
  }
}

const sdk = new TorusSDK(Config, logger.child({ from: 'TorusSDK' }))

sdk.addStrategy('facebook', FacebookStrategy)
sdk.addStrategy('google-old', GoogleLegacyStrategy)
sdk.addStrategy('google', GoogleStrategy)
sdk.addStrategy('auth0', Auth0Strategy)
sdk.addStrategy('auth0-pwdless-email', PaswordlessEmailStrategy)
sdk.addStrategy('auth0-pwdless-sms', PaswordlessSMSStrategy)

export default sdk
