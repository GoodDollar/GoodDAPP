// @flow

import React from 'react'
import ReactDOM from 'react-dom'
import fontMaterialIcons from 'react-native-vector-icons/Fonts/MaterialIcons.ttf'
import AsyncStorage from './lib/utils/asyncStorage'
import './index.css'
import App from './App'
import './components/common/view/Icon/index.css'
import { initStore, default as SimpleStore } from './lib/undux/SimpleStore'
import Config from './config/config'
import { deleteGunDB } from './lib/hooks/useDeleteAccountDialog'

let ErrorBoundary = React.Fragment

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

  // remove all local data so its not cached and user will re-login
  await Promise.all([/*AsyncStorage.clear(), */ req.catch()])
}

const { hot } = require('react-hot-loader')
const HotApp = hot(module)(App)

// init().then(() => {
// load simple store with initial async values from localStorage(asyncstorage)
upgradeVersion()
  .then(_ => initStore())
  .then(() => {
    ReactDOM.render(
      <ErrorBoundary>
        <SimpleStore.Container>
          <HotApp />
          <style type="text/css">{`
            @font-face {
              src: url(${fontMaterialIcons});
              font-family: MaterialIcons;
            }
          `}</style>
        </SimpleStore.Container>
      </ErrorBoundary>,
      document.getElementById('root'),
    )
  })

// })
