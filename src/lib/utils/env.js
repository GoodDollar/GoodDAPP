// @flow

import { Platform } from 'react-native'
import env from '../../config/env'

const envUrl = env.REACT_APP_PUBLIC_URL

const getDefaultUrl = env => {
  switch (env) {
    case 'development':
      return 'https://gooddev.netlify.app'
    case 'staging':
      return 'https://goodqa.netlify.app'
    case 'production':
      return 'https://wallet.gooddollar.org'
    default:
      return
  }
}

export const fixNL = envValue => (envValue || '').replace(/\\{1,2}n/gm, '\n')

export const appEnv = env.REACT_APP_ENV || 'development'

export const appUrl = Platform.select({
  web: () => envUrl || window.location.origin,
  default: () => (envUrl && !envUrl.includes('/localhost:') ? envUrl : getDefaultUrl(appEnv)),
})()
