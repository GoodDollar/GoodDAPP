import { AppRegistry } from 'react-native'
import React from  'react'
import App from './src/App'
import { name as appName } from './app.json'
import 'react-native-gesture-handler'
import { SafeAreaProvider } from 'react-native-safe-area-context'

const DeApp  = () => (
  <SafeAreaProvider>
    <App />
  </SafeAreaProvider>
)

AppRegistry.registerComponent(appName, () => DeApp)
