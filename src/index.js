import React from 'react'
import ReactDOM from 'react-dom'
import { AsyncStorage } from 'react-native'
import bugsnag from '@bugsnag/js'
import bugsnagReact from '@bugsnag/plugin-react'
import './index.css'
import fontMaterialIcons from 'react-native-vector-icons/Fonts/MaterialIcons.ttf'
import App from './App'
import { initStore, default as SimpleStore } from './lib/undux/SimpleStore'
import Config from './config/config'

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

const fontStylesMaterialIcons = `@font-face { src: url(${fontMaterialIcons}); font-family: MaterialIcons; }`
const style = document.createElement('style')
style.type = 'text/css'
if (style.styleSheet) {
  style.styleSheet.cssText = fontStylesMaterialIcons
} else {
  style.appendChild(document.createTextNode(fontStylesMaterialIcons))
}

/**
 * decide if we need to clear storage
 */
const upgradeVersion = async () => {
  const valid = ['etoro', 'beta.11']
  const required = Config.isEToro ? 'etoro' : 'beta.11'
  const version = await AsyncStorage.getItem('GD_version')
  if (valid.includes(version)) {
    return
  }
  await AsyncStorage.clear()
  return AsyncStorage.setItem('GD_version', required)
}

// Inject stylesheet
document.head.appendChild(style)

// init().then(() => {
//load simple store with initial async values from localStorage(asyncstorage)
upgradeVersion()
  .then(_ => initStore())
  .then(() => {
    ReactDOM.render(
      <ErrorBoundary>
        <SimpleStore.Container>
          <App />
        </SimpleStore.Container>
      </ErrorBoundary>,
      document.getElementById('root')
    )
  })

// })
