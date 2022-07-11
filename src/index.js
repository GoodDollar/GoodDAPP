// @flow
import React from 'react'
import ReactDOM from 'react-dom'
import fontMaterialIcons from 'react-native-vector-icons/Fonts/MaterialIcons.ttf'
import fontMaterialCommunityIcons from 'react-native-vector-icons/Fonts/MaterialCommunityIcons.ttf'

import AppHolder from './mainApp/AppHolder'
import SmartBanner from './components/smartbanner/SmartBanner'

import './index.css'
import './assets/fonts/index.css'

let ErrorBoundary = React.Fragment

ReactDOM.render(
  <ErrorBoundary>
    <SmartBanner />
    <AppHolder />
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
  </ErrorBoundary>,
  document.getElementById('root'),
)
