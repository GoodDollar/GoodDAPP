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

export const useTorus = () => {
  const [sdk, setSDK] = useState(undefined)

  const registerTorusWorker = async () => {
    try {
      const res = await torus.init()
      log.debug('torus service initialized', { res })
      setSDK(torus)
    } catch (e) {
      log.error('failed initializing torus', e.message, e)
    }
  }
  useEffect(() => {
    registerTorusWorker()
  }, [])

  return sdk
}
