import { useEffect, useState } from 'react'
import TorusSdk from '@toruslabs/torus-direct-web-sdk'
import config from '../../config/config'
import logger from '../../lib/logger/pino-logger'

const log = logger.child({ from: 'AuthTorus' })

export const torusGoogle = new TorusSdk({
  typeOfLogin: 'google',
  verifier: 'google-gooddollar',
  GOOGLE_CLIENT_ID: config.googleClientId,
  proxyContractAddress: '0x4023d2a0D330bF11426B12C6144Cfb96B7fa6183', // details for test net
  network: 'ropsten', // details for test net
  redirect_uri: `${config.publicUrl}/torus/redirect`,
  enableLogging: config.env === 'development',
})

export const torusFacebook = new TorusSdk({
  typeOfLogin: 'facebook',
  verifier: 'facebook-gooddollar',
  FACEBOOK_APP_ID: config.facebookAppId,
  proxyContractAddress: '0x4023d2a0D330bF11426B12C6144Cfb96B7fa6183', // details for test net
  network: 'ropsten', // details for test net
  redirect_uri: `${config.publicUrl}/torus/redirect`,
  enableLogging: config.env === 'development',
})

export const useTorusServiceWorker = () => {
  const [serviceWorker, setServiceWorker] = useState(undefined)

  const registerTorusWorker = async () => {
    try {
      const registration = await navigator.serviceWorker.register(`${config.publicUrl}/torus//sw.js`)
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
        serviceWorker.unregister()
      }
    }
  }, [])

  return !!serviceWorker
}
