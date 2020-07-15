import React from 'react'
import { createSwitchNavigator } from '@react-navigation/core'
import { View } from 'react-native'
import createAppContainer from './lib/utils/createAppContainer'
import { isAndroid } from './lib/utils/platform'
import Config from './config/config'
import Signup from './components/signup/SignupState'
import SigninInfo from './components/signin/SigninInfo'
import Auth from './components/auth/Auth'
import InvalidW3TokenError from './components/signup/InvalidWeb3TokenError'
import Blurred from './components/common/view/Blur/Blurred'
import SimpleStore from './lib/undux/SimpleStore.js'
import { fireEventFromNavigation } from './lib/analytics/analytics'
import { getOriginalScreenHeight } from './lib/utils/Orientation'

// import IOSWebAppSignIn from './components/signin/IOSWebAppSignIn'

const initialRouteName = 'Auth' // isMobileSafari && isWebApp ? 'IOSWebAppSignIn' : 'Auth'

const routes = {
  Auth,
  Signup,
  InvalidW3TokenError,

  // IOSWebAppSignIn,
}

if (Config.enableSelfCustody) {
  Object.assign(routes, { SigninInfo })
}

const router = createSwitchNavigator(routes, { initialRouteName })

const RouterWrapper = createAppContainer(router)

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
        <View style={{ minHeight, ...fullScreenContainer }}>
          <RouterWrapper onNavigationStateChange={(prevNav, nav, action) => fireEventFromNavigation(action)} />
        </View>
      </Blurred>
    </>
  )
}
export default Router
