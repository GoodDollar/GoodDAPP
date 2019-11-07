import React from 'react'
import ReactDOM from 'react-dom'
import { AsyncStorage } from 'react-native'
import './index.css'
import fontMaterialIcons from 'react-native-vector-icons/Fonts/MaterialIcons.ttf'
import App from './App'
import * as serviceWorker from './serviceWorker'
import { initStore, default as SimpleStore } from './lib/undux/SimpleStore'
import Config from './config/config'

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
  const required = Config.isEToro ? 'etoro' : 'beta.11'
  const version = await AsyncStorage.getItem('GD_version')
  if (version === required) {
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
      <SimpleStore.Container>
        <App />
      </SimpleStore.Container>,
      document.getElementById('root')
    )
  })

// })

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.register()
