import React from 'react'
import ReactDOM from 'react-dom'
import fontMaterialIcons from 'react-native-vector-icons/Fonts/MaterialIcons.ttf'
import AsyncStorage from './lib/utils/asyncStorage'
import './index.css'
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
  const valid = ['phase1'] //in case multiple versions are valid
  const current = 'phase' + Config.phase
  valid.push(current)
  const version = await AsyncStorage.getItem('GD_version')
  const isNext = window.location.hostname.startsWith('next') //TODO: remove in next version. patch because we forgot to set version, so we dont cause next users to reset data
  if (valid.includes(version) || isNext) {
    return
  }

  const req = deleteGunDB()

  //remove all local data so its not cached and user will re-login
  await Promise.all([AsyncStorage.clear(), req.catch()])
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
