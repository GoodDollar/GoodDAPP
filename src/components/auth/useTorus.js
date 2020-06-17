import { useEffect, useState } from 'react'
import TorusSdk from '@toruslabs/torus-direct-web-sdk'
import config from '../../config/config'
import logger from '../../lib/logger/pino-logger'

const log = logger.child({ from: 'AuthTorus' })

const sdkOptions = {
  proxyContractAddress: '0x4023d2a0D330bF11426B12C6144Cfb96B7fa6183', // details for test net
  network: 'ropsten', // details for test net
  baseUrl: `${config.publicUrl}/torus/`,
  enableLogging: config.env === 'development',
}
export const torus = new TorusSdk({
  GOOGLE_CLIENT_ID: config.googleClientId,
  FACEBOOK_CLIENT_ID: config.facebookAppId,
  ...sdkOptions,
})

class TorusLogin {
  constructor(sdk) {
    this.sdk = sdk
  }

  cleanUser(torusUser) {
    //aggregate login returns an array with user info
    if (torusUser.userInfo) {
      torusUser = { ...torusUser, ...(torusUser.userInfo[0] || torusUser.userInfo) }
    }
    if (torusUser.name === torusUser.email) {
      delete torusUser.name
    }
    if ((torusUser.name.match(/\+[0-9]+$/) || []).length) {
      torusUser.mobile = torusUser.name
      delete torusUser.name
    }
    return torusUser
  }

  // eslint-disable-next-line require-await
  async triggerLogin(verifier) {
    log.debug('triggerLogin', { verifier }, Array.isArray(this.settings))
    switch (verifier) {
      default:
      case 'facebook':
        return this.sdk
          .triggerLogin({ typeOfLogin: 'facebook', verifier: 'facebook-gooddollar', clientId: config.facebookAppId })
          .then(this.cleanUser)
      case 'google-old':
        return this.sdk
          .triggerLogin({ typeOfLoing: 'google', verifier: 'google-gooddollar', clientId: config.googleClientId })
          .then(this.cleanUser)
      case 'google':
        return this.sdk
          .triggerAggregateLogin({
            aggregateVerifierType: 'single_id_verifier',
            verifierIdentifier: 'google-auth0-gooddollar',
            subVerifierDetailsArray: [
              {
                clientId: config.googleClientId,
                typeOfLogin: 'google',
                verifier: 'google-shubs',
              },
            ],
          })
          .then(this.cleanUser)
      case 'auth0':
        return this.sdk
          .triggerAggregateLogin({
            aggregateVerifierType: 'single_id_verifier',
            verifierIdentifier: 'google-auth0-gooddollar',
            subVerifierDetailsArray: [
              {
                clientId: config.auth0ClientId,
                typeOfLogin: 'jwt',
                verifier: 'auth0',
                jwtParams: {
                  connection: 'Username-Password-Authentication',
                  domain: config.auth0Domain,
                },
              },
            ],
          })
          .then(this.cleanUser)

      case 'auth0-pwdless-email':
        return this.sdk
          .triggerAggregateLogin({
            aggregateVerifierType: 'single_id_verifier',
            verifierIdentifier: 'google-auth0-gooddollar',
            subVerifierDetailsArray: [
              {
                clientId: config.auth0ClientId,
                typeOfLogin: 'jwt',
                verifier: 'auth0',
                jwtParams: {
                  connection: '',
                  domain: config.auth0Domain,
                  verifierIdField: 'name',
                },
              },
            ],
          })
          .then(this.cleanUser)

      case 'auth0-pwdless-sms':
        return this.sdk
          .triggerLogin({
            verifier: 'gooddollar-auth0-sms-passwordless',
            clientId: config.auth0SMSClientId,
            typeOfLogin: 'jwt',
            jwtParams: {
              connection: '',
              domain: config.auth0Domain,
              verifierIdField: 'name',
            },
          })
          .then(this.cleanUser)
    }
  }
}
export const useTorus = () => {
  const [sdk, setSDK] = useState(undefined)

  const registerTorusWorker = async () => {
    try {
      const res = await torus.init()
      const sdkInstance = new TorusLogin(torus)
      log.debug('torus service initialized', { res, sdkInstance })
      setSDK(sdkInstance)
    } catch (e) {
      log.error('failed initializing torus', e.message, e)
    }
  }
  useEffect(() => {
    registerTorusWorker()
  }, [])

  return sdk
}
