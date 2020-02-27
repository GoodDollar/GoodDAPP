// @flow

import React from 'react'
import ReactDOM from 'react-dom'
import './index.css'
import App from './App'
import './components/common/view/Icon/index.css'

const { hot } = require('react-hot-loader')
const HotApp = hot(module)(App)

const WebApp = () => (
  <React.Fragment>
    <HotApp />
    <style type="text/css">{`
      @font-face {
        font-family: 'MaterialCommunityIcons';
        src: url(${require('react-native-vector-icons/Fonts/MaterialCommunityIcons.ttf')}) format('truetype');
      }
    `}</style>
  </React.Fragment>
)

ReactDOM.render(<WebApp />, document.getElementById('root'))
