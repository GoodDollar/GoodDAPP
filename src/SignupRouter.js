import React from 'react'
import { createSwitchNavigator } from '@react-navigation/core'

import Config from './config/config'
import createAppContainer from './lib/utils/createAppContainer'
import useNavigationStateHandler from './lib/hooks/useNavigationStateHandler'

import Signup from './components/signup/SignupState'
import SigninInfo from './components/signin/SigninInfo'
import Blurred from './components/common/view/Blurred'
import Welcome from './components/auth/login/WelcomeScreen'
import hot from './lib/hoc/hotLoader'

const initialRouteName = 'Welcome'

const routes = {
  Welcome,
  Signup,
}

if (Config.enableSelfCustody) {
  Object.assign(routes, { SigninInfo })
}

const router = createSwitchNavigator(routes, { initialRouteName })

const RouterWrapper = createAppContainer(router)

const Router = () => {
  const navigationStateHandler = useNavigationStateHandler()

  return (
    <>
      <Blurred whenDialog>
        <RouterWrapper onNavigationStateChange={navigationStateHandler} />
      </Blurred>
    </>
  )
}
export default hot(Router)
