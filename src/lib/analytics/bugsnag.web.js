import React, { Fragment } from 'react'
import bugsnag from '@bugsnag/js'
import bugsnagReact from '@bugsnag/plugin-react'
import Config from '../../config/config'

let ErrorBoundary = Fragment
let client = null

if (Config.bugsnagKey) {
  client = bugsnag({
    apiKey: Config.bugsnagKey,
    appVersion: Config.version,
    releaseStage: Config.env + '_' + Config.network,
  })

  client.metaData = { network: Config.network }
  client.use(bugsnagReact, React)
  ErrorBoundary = client.getPlugin('react')
}

export default client
export { ErrorBoundary }
