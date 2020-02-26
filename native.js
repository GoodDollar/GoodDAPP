import { AppRegistry } from 'react-native'
import React from  'react'
//need to import this here before webviewcrypto to prevent circular require because of
//global.crypto = {} dont know why
import 'react-native-crypto'
import WebviewCrypto from '@gooddollar/react-native-webview-crypto'
import App from './src/App'
import { name as appName } from './app.json'
import 'react-native-gesture-handler'
import { SafeAreaProvider } from 'react-native-safe-area-context';

const DeApp  = () => (
  <SafeAreaProvider>
    <WebviewCrypto/>
    <App />
  </SafeAreaProvider>
)

AppRegistry.registerComponent(appName, () => DeApp)
