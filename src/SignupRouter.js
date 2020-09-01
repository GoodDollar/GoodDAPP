import React from 'react'
import { createBrowserApp } from '@react-navigation/web'
import { createSwitchNavigator } from '@react-navigation/core'
import { Platform } from 'react-native'
import { isAndroid } from 'mobile-device-detect'
import Config from './config/config'
import Signup from './components/signup/SignupState'
import SigninInfo from './components/signin/SigninInfo'
import Auth from './components/auth/Auth'
import AuthTorus from './components/auth/torus/AuthTorus'
import InvalidW3TokenError from './components/signup/InvalidWeb3TokenError'
import Blurred from './components/common/view/Blurred'
import './components/appNavigation/blurFx.css'
import SimpleStore from './lib/undux/SimpleStore.js'
import { getOriginalScreenHeight } from './lib/utils/Orientation'
import useNavigationStateHandler from './lib/hooks/useNavigationStateHandler'

// import IOSWebAppSignIn from './components/signin/IOSWebAppSignIn'

const initialRouteName = 'Auth' // isMobileSafari && isWebApp ? 'IOSWebAppSignIn' : 'Auth'
const AuthType = Config.torusEnabled ? AuthTorus : Auth

const routes = {
  Auth: AuthType,
  Signup,
  InvalidW3TokenError,

  // IOSWebAppSignIn,
}

if (Config.enableSelfCustody) {
  Object.assign(routes, { SigninInfo })
}

const router = createSwitchNavigator(routes, { initialRouteName })

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

  const navigationStateHandler = useNavigationStateHandler()

  return (
    <>
      <Blurred style={{ minHeight, ...fullScreenContainer }} blur={dialogVisible}>
        <WebRouter onNavigationStateChange={navigationStateHandler} />
      </Blurred>
    </>
  )
}
export default Router
