import { Platform } from 'react-native'
import env from './env'

const { search: qs = '' } = Platform.select({
  web: () => window.location,
  default: () => ({})
})()

const [forceLogLevel] = qs.match(/level=(.*?)($|&)/) || []

export const forcePeer = qs.match(/gun=(.*?)($|&)/)
export const logLevel = forceLogLevel || env.REACT_APP_LOG_LEVEL || 'debug'
