// @flow
import React from 'react'
import ReactDOM from 'react-dom'
import { setConfig } from 'react-hot-loader'
import App from './App'
import './index.css'
import './components/common/view/Icon/index.css'

setConfig({ logLevel: 'debug' })

const WebApp = () => (
  <React.Fragment>
    <App />
    <style type="text/css">{`
      @font-face {
        font-family: 'MaterialCommunityIcons';
        src: url(${require('react-native-vector-icons/Fonts/MaterialCommunityIcons.ttf')}) format('truetype');
      }
    `}</style>
  </React.Fragment>
)

ReactDOM.render(<WebApp />, document.getElementById('root'))
