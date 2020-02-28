import { Fragment } from 'react'
import { Client, Configuration } from 'bugsnag-react-native'
import Config from '../../config/config'

let client = null

if (Config.bugsnagKey) {
  const config = new Configuration(Config.bugsnagKey)
  config.appVersion = Config.version
  config.releaseStage = Config.env + '_' + Config.network,
  client = new Client(config)
}

export default client
export const ErrorBoundary = Fragment
