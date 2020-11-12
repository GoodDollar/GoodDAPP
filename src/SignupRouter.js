import React from 'react'
import { createBrowserApp } from '@react-navigation/web'
import { createSwitchNavigator } from '@react-navigation/core'
import { Platform } from 'react-native'
import Config from './config/config'
import Signup from './components/signup/SignupState'
import SigninInfo from './components/signin/SigninInfo'
import Blurred from './components/common/view/Blurred'
import useNavigationStateHandler from './lib/hooks/useNavigationStateHandler'
import Welcome from './components/auth/login/WelcomeScreen'

const initialRouteName = 'Welcome'

const routes = {
  Welcome,
  Signup,
}

if (Config.enableSelfCustody) {
  Object.assign(routes, { SigninInfo })
}

const router = createSwitchNavigator(routes, { initialRouteName })

let WebRouter

if (Platform.OS === 'web') {
  WebRouter = createBrowserApp(router)
}

const Router = () => {
  const navigationStateHandler = useNavigationStateHandler()

  return (
    <>
      <Blurred whenDialog>
        <WebRouter onNavigationStateChange={navigationStateHandler} />
      </Blurred>
    </>
  )
}

export default Router
