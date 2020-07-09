import React from 'react'
import ReactDOM from 'react-dom'
import { AsyncStorage } from 'react-native'
import './index.css'
import fontMaterialIcons from 'react-native-vector-icons/Fonts/MaterialIcons.ttf'
import App from './App'
import { initStore, default as SimpleStore } from './lib/undux/SimpleStore'
import Config from './config/config'
import { deleteGunDB } from './lib/hooks/useDeleteAccountDialog'

let ErrorBoundary = React.Fragment

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
  const valid = ['etoro', 'phase0-a']
  const required = Config.isEToro ? 'etoro' : 'phase0-a'
  const version = await AsyncStorage.getItem('GD_version')
  if (version == null || valid.includes(version)) {
    return
  }
  const req = deleteGunDB()

  //remove all local data so its not cached and user will re-login
  await Promise.all([AsyncStorage.clear(), req.catch()])
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
      document.getElementById('root'),
    )
  })

// })
