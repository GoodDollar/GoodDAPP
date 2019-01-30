import React from 'react'
import { createNavigator, SwitchRouter, SwitchView } from '@react-navigation/core'
import { createBrowserApp, Link } from '@react-navigation/web'
import { Platform } from 'react-native'
// import App from './src/App';
import Signup from './components/signup/SignupState'
import AppNavigation from './components/appNavigation/AppNavigation'

const AppNavigator = isLoggedIn =>
  createNavigator(
    SwitchView,
    SwitchRouter(
      {
        Signup,
        AppNavigation
      },
      {
        initialRouteName: isLoggedIn ? 'AppNavigation' : 'Signup'
      }
    ),
    {}
  )

let CreateRouter = ({ isLoggedIn }) => {
  if (Platform.OS === 'web') {
    let WebRouter = createBrowserApp(AppNavigator(isLoggedIn))
    return <WebRouter />
  }
}

export { CreateRouter }
