// @flow
import React from 'react'
import ReactDOM from 'react-dom'
import fontMaterialIcons from 'react-native-vector-icons/Fonts/MaterialIcons.ttf'

import AppHolder from './mainApp/AppHolder'
import SmartBanner from './components/smartbanner/SmartBanner'

import './index.css'
import './components/common/view/Icon/index.css'
import LanguageProvider from './language/i18n'

let ErrorBoundary = React.Fragment

ReactDOM.render(
  <ErrorBoundary>
    <SmartBanner />
    <LanguageProvider>
      <AppHolder />
    </LanguageProvider>
    <style type="text/css">{`
            @font-face {
              src: url(${fontMaterialIcons});
              font-family: MaterialIcons;
            }
          `}</style>
  </ErrorBoundary>,
  document.getElementById('root'),
)
