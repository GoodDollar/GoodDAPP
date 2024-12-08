import { osName, osVersion } from 'mobile-device-detect'
import { version } from '../../../package.json'
import env from '../../config/env'

export const analyticsConfig = {
  google: { enabled: true },
  amplitude: { apiKey: env.REACT_APP_AMPLITUDE_API_KEY, enabled: true },
}

export const appProps = {
  env: '',
  version: version,
  osVersion: `${osName} ${osVersion}`,
  productEnv: 'gw',
}
