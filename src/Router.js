import React from 'react'
import { createNavigator, SwitchRouter } from '@react-navigation/core'
import { createBrowserApp } from '@react-navigation/web'
import { Platform } from 'react-native'
import Signup from './components/signup/SignupState'
import AppNavigation from './components/appNavigation/AppNavigation'
import AppSwitch from './components/AppSwitch'

const AppNavigator = createNavigator(
  AppSwitch,
  SwitchRouter(
    {
      Signup,
      AppNavigation
    },
    {
      initialRouteName: 'Signup'
    }
  ),
  {}
)
let WebRouter
if (Platform.OS === 'web') {
  WebRouter = createBrowserApp(AppNavigator)
}

export { WebRouter }
