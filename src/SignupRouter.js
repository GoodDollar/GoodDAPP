import React from 'react'
import { createBrowserApp } from '@react-navigation/web'
import { createSwitchNavigator } from '@react-navigation/core'

import { Platform } from 'react-native'
import Signup from './components/signup/SignupState'
import Auth from './components/auth/Auth'

const router = createSwitchNavigator(
  {
    Auth,
    Signup
  },
  {
    initialRouteName: 'Auth'
  }
)
let WebRouter
if (Platform.OS === 'web') {
  WebRouter = createBrowserApp(router)
}
const Router = () => {
  return <WebRouter />
}
export default Router
