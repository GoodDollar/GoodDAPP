// @flow
import React from 'react'
import ReactDOM from 'react-dom'
import fontMaterialIcons from 'react-native-vector-icons/Fonts/MaterialIcons.ttf'
import fontMaterialCommunityIcons from 'react-native-vector-icons/Fonts/MaterialCommunityIcons.ttf'

import './index.css'
import './assets/fonts/index.css'

const BuildTarget = {
  FaceVerification: 'FV',
  WalletApp: 'DAPP',
}

// eslint-disable-next-line require-await
const importBuildTarget = async () => {
  switch (process.env.REACT_APP_BUILD_TARGET) {
    case BuildTarget.FaceVerification:
      return import('./components/faceVerification/standalone/App')
    default:
      return import('./mainApp/WalletApp')
  }
}

// Import the entry point and render it's default export
importBuildTarget().then(({ default: AppRoot }) => {
  ReactDOM.render(
    <React.StrictMode>
      <>
        <AppRoot />
        <style type="text/css">{`
           @font-face {
            src: url(${fontMaterialIcons});
            font-family: MaterialIcons;
          }
          @font-face {
            src: url(${fontMaterialCommunityIcons});
            font-family: MaterialCommunityIcons;
          }
        `}</style>
      </>
    </React.StrictMode>,
    document.getElementById('root'),
  )
})
