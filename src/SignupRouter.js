import React, { useMemo } from 'react'
import { createSwitchNavigator } from '@react-navigation/core'
import Config from './config/config'

import createAppContainer from './lib/utils/createAppContainer'
import useNavigationStateHandler from './lib/hooks/useNavigationStateHandler'
import logger from './lib/logger/js-logger'

import Signup from './components/signup/SignupState'
import SigninInfo from './components/signin/SigninInfo'
import Blurred from './components/common/view/Blurred'
import Welcome from './components/auth/login/WelcomeScreen'
import InviteWelcome from './components/inviteWelcome/InviteWelcome'

const log = logger.get('SignupRouter')

const generateRouter = () => {
  const initialRouteName = 'InviteWelcome'
  const { enableSelfCustody } = Config

  const routes = {
    Welcome,
    InviteWelcome,
    Signup,
  }

  if (enableSelfCustody) {
    Object.assign(routes, { SigninInfo })
  }

  const router = createSwitchNavigator(routes, { initialRouteName })

  log.debug('Generated signup router', { enableSelfCustody, initialRouteName })
  return createAppContainer(router)
}

const Router = () => {
  const navigationStateHandler = useNavigationStateHandler()

  // will exec once during first render
  const RouterWrapper = useMemo(generateRouter, [])

  return (
    <>
      <Blurred whenDialog>
        <RouterWrapper onNavigationStateChange={navigationStateHandler} />
      </Blurred>
    </>
  )
}

export default Router
