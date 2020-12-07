// @flow
import React from 'react'
import ReactDOM from 'react-dom'
import fontMaterialIcons from 'react-native-vector-icons/Fonts/MaterialIcons.ttf'
import './index.css'
import AppHolder from './mainApp/AppHolder'
import './components/common/view/Icon/index.css'

let ErrorBoundary = React.Fragment

ReactDOM.render(
  <ErrorBoundary>
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
