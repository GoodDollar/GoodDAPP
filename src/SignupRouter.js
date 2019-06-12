import React from 'react'
import { createBrowserApp } from '@react-navigation/web'
import { Platform } from 'react-native'
import Signup from './components/signup/SignupState'

const Router = () => {
  let WebRouter
  if (Platform.OS === 'web') {
    WebRouter = createBrowserApp(Signup)
  }
  return <WebRouter isLoggedIn />
}
export default Router
