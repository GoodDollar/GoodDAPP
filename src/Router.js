import React from 'react'
import { createNavigator, SwitchRouter } from '@react-navigation/core'
import { createBrowserApp } from '@react-navigation/web'
import { Platform } from 'react-native'
import Auth from './components/auth/Auth'
import Signup from './components/signup/SignupState'
import AppNavigation from './components/appNavigation/AppNavigation'
import AppSwitch from './components/AppSwitch'

const AppNavigator = createNavigator(
  AppSwitch,
  SwitchRouter(
    {
      Auth,
      Signup,
      AppNavigation
    },
    {
      initialRouteName: 'Auth'
    }
  ),
  {}
)
let WebRouter
if (Platform.OS === 'web') {
  WebRouter = createBrowserApp(AppNavigator)
}

export { WebRouter }
