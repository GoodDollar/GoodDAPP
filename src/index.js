// @flow
import React from 'react'
import ReactDOM from 'react-dom'
import fontMaterialIcons from 'react-native-vector-icons/Fonts/MaterialIcons.ttf'

import Config from './config/config'

import AppHolder from './mainApp/AppHolder'
import SmartBanner from './components/smartbanner/SmartBanner'

import './index.css'
import './components/common/view/Icon/index.css'

let ErrorBoundary = React.Fragment

ReactDOM.render(
  <ErrorBoundary>
    {Config.suggestMobileApp && <SmartBanner />}
    <AppHolder />
    <style type="text/css">{`
            @font-face {
              src: url(${fontMaterialIcons});
              font-family: MaterialIcons;
            }
          `}</style>
  </ErrorBoundary>,
  document.getElementById('root'),
)
