import React from 'react'
import { createBrowserApp } from '@react-navigation/web'
import { createSwitchNavigator } from '@react-navigation/core'
import { Platform } from 'react-native'
import { isAndroid, isMobileSafari } from 'mobile-device-detect'
import Config from './config/config'
import Signup from './components/signup/SignupState'
import SigninInfo from './components/signin/SigninInfo'
import IOSWebAppSignIn from './components/signin/IOSWebAppSignIn'
import Auth from './components/auth/Auth'
import AuthTorus from './components/auth/AuthTorus'
import InvalidW3TokenError from './components/signup/InvalidWeb3TokenError'
import Blurred from './components/common/view/Blurred'
import './components/appNavigation/blurFx.css'
import SimpleStore from './lib/undux/SimpleStore.js'
import { fireEventFromNavigation } from './lib/analytics/analytics'
import isWebApp from './lib/utils/isWebApp'
import { getOriginalScreenHeight } from './lib/utils/Orientation'

const initialRouteName = isMobileSafari && isWebApp ? 'IOSWebAppSignIn' : 'Auth'
const AuthType = Config.torusEnabled ? AuthTorus : Auth
const router = createSwitchNavigator(
  {
    Auth: AuthType,
    Signup,
    InvalidW3TokenError,
    SigninInfo,
    IOSWebAppSignIn,
  },
  {
    initialRouteName,
  }
)
let WebRouter
if (Platform.OS === 'web') {
  WebRouter = createBrowserApp(router)
}

const fullScreenContainer = {
  top: 0,
  left: 0,
  bottom: 0,
  right: 0,
  position: 'absolute',
  display: 'flex',
  flexGrow: 1,
  flexDirection: 'column',
}

const Router = () => {
  const store = SimpleStore.useStore()
  const { visible: dialogVisible } = store.get('currentScreen').dialogData
  const isShowKeyboard = store.get && store.get('isMobileKeyboardShown')
  let minHeight = 480

  if (isAndroid && isShowKeyboard) {
    minHeight = getOriginalScreenHeight()
  }

  return (
    <>
      <Blurred style={{ minHeight, ...fullScreenContainer }} blur={dialogVisible}>
        <WebRouter onNavigationStateChange={(prevNav, nav, action) => fireEventFromNavigation(action)} />
      </Blurred>
    </>
  )
}
export default Router
