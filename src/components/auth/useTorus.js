import { useEffect, useState } from 'react'
import TorusSdk from '@toruslabs/torus-direct-web-sdk'
import config from '../../config/config'
import logger from '../../lib/logger/pino-logger'

const log = logger.child({ from: 'AuthTorus' })

const sdkOptions = {
  proxyContractAddress: '0x4023d2a0D330bF11426B12C6144Cfb96B7fa6183', // details for test net
  network: 'ropsten', // details for test net
  redirect_uri: `${config.publicUrl}/torus/redirect`,
  enableLogging: config.env === 'development',
}
export const torusGoogle = new TorusSdk({
  typeOfLogin: 'google',
  verifier: 'google-gooddollar',
  GOOGLE_CLIENT_ID: config.googleClientId,
  ...sdkOptions,
})

export const torusFacebook = new TorusSdk({
  typeOfLogin: 'facebook',
  verifier: 'facebook-gooddollar',
  FACEBOOK_APP_ID: config.facebookAppId,
  ...sdkOptions,
})

export const useTorusServiceWorker = () => {
  const [serviceWorker, setServiceWorker] = useState(undefined)

  const registerTorusWorker = async () => {
    try {
      const registration = await navigator.serviceWorker.register(`${config.publicUrl}/torus/sw.js`)
      log.debug('torus service worker registerd', { registration })
      setServiceWorker(registration)
    } catch (e) {
      log.error('failed registering torus service worker', e.message, e)
    }
  }
  useEffect(() => {
    registerTorusWorker()
    return () => {
      if (serviceWorker) {
        log.debug('unregistering torus service worker')
        serviceWorker.unregister()
      }
    }
  }, [])

  return !!serviceWorker
}
