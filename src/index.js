// @flow

import React from 'react'
import ReactDOM from 'react-dom'
import './index.css'
import App from './App'
import Config from './config/config'
import bugsnag from '@bugsnag/js'
import bugsnagReact from '@bugsnag/plugin-react'

// import fontMaterialIcons from 'react-native-vector-icons/Fonts/MaterialIcons.ttf'
//
// const fontStylesMaterialIcons = `@font-face { src: url(${fontMaterialIcons}); font-family: MaterialIcons; }`
// const style = document.createElement('style')
// style.type = 'text/css'
// if (style.styleSheet) {
//   style.styleSheet.cssText = fontStylesMaterialIcons
// } else {
//   style.appendChild(document.createTextNode(fontStylesMaterialIcons))
// }
//
// document.head.appendChild(style)

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

const WebApp = () => (
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
)

ReactDOM.render(<WebApp />, document.getElementById('root'))
