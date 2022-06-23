// @flow
import React from 'react'
import ReactDOM from 'react-dom'
import fontMaterialIcons from 'react-native-vector-icons/Fonts/MaterialIcons.ttf'

import './index.css'
import './components/common/view/Icon/index.css'

let ErrorBoundary = React.Fragment

function importBuildTarget() {
  if (process.env.REACT_APP_BUILD_TARGET === 'FV') {
    return import('./mainApp/fv.js')
  }
  return import('./mainApp/wallet.js')
}

// Import the entry point and render it's default export
importBuildTarget().then(({ default: Environment }) => {
  ReactDOM.render(
    <React.StrictMode>
      <ErrorBoundary>
        <Environment />
        <style type="text/css">{`
            @font-face {
              src: url(${fontMaterialIcons});
              font-family: MaterialIcons;
            }
          `}</style>
      </ErrorBoundary>
    </React.StrictMode>,
    document.getElementById('root'),
  )
})
