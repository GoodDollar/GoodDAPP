// @flow
import React from 'react'
import ReactDOM from 'react-dom'
import fontMaterialIcons from 'react-native-vector-icons/Fonts/MaterialIcons.ttf'

import './index.css'
import './assets/fonts/index.css'

export default AppRoot => {
  ReactDOM.render(
    <React.StrictMode>
      <>
        <AppRoot />
        <style type="text/css">{`
           @font-face {
            src: url(${fontMaterialIcons});
            font-family: MaterialIcons;
          }          
        `}</style>
      </>
    </React.StrictMode>,
    document.getElementById('root'),
  )
}
