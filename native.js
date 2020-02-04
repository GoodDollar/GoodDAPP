import { AppRegistry } from 'react-native'
import React from  'react'
import { Client, Configuration } from 'bugsnag-react-native'
import App from './src/App'
import { name as appName } from './app.json'
import 'react-native-gesture-handler'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import Config from './src/config/config'

if (Config.bugsnagKey) {
  const config = new Configuration(Config.bugsnagKey)
  config.appVersion = require('./package.json').version
  new Client(config)
}

const DeApp  = () => (
  <SafeAreaProvider>
    <App />
  </SafeAreaProvider>
)

AppRegistry.registerComponent(appName, () => DeApp)
