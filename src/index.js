// @flow

import React from 'react'
import ReactDOM from 'react-dom'
import './index.css'
import bugsnag from '@bugsnag/js'
import bugsnagReact from '@bugsnag/plugin-react'
import Config from './config/config'
import App from './App'
import './components/common/view/Icon/index.css'

let ErrorBoundary = React.Fragment

if (Config.bugsnagKey) {
  const bugsnagClient = bugsnag({
    apiKey: Config.bugsnagKey,
    appVersion: Config.version,
    releaseStage: Config.env + '_' + Config.network,
  })
  global.bugsnagClient = bugsnagClient
  bugsnagClient.metaData = { network: Config.network }
  bugsnagClient.use(bugsnagReact, React)
  ErrorBoundary = bugsnagClient.getPlugin('react')
}

const { hot } = require('react-hot-loader')
const HotApp = hot(module)(App)

const WebApp = () => (
  <ErrorBoundary>
    <React.Fragment>
      <HotApp />
      <style type="text/css">{`
        @font-face {
          font-family: 'MaterialCommunityIcons';
          src: url(${require('react-native-vector-icons/Fonts/MaterialCommunityIcons.ttf')}) format('truetype');
        }
      `}</style>
    </React.Fragment>
  </ErrorBoundary>
)

ReactDOM.render(<WebApp />, document.getElementById('root'))
