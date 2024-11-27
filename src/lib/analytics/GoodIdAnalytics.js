import { osName, osVersion } from 'mobile-device-detect'
import { version } from '../../../package.json'

export const analyticsConfig = {
  google: { enabled: true },
  amplitude: { apiKey: process.env.REACT_APP_AMPLITUDE_API_KEY, enabled: true },
}

export const appProps = {
  env: '',
  version: version,
  osVersion: `${osName} ${osVersion}`,
  productEnv: 'gw',
}
