import React from 'react'
import { createSwitchNavigator } from '@react-navigation/core'
import { once } from 'lodash'
import Config from './config/config'
import createAppContainer from './lib/utils/createAppContainer'
import useNavigationStateHandler from './lib/hooks/useNavigationStateHandler'
import DeepLinking from './lib/utils/deepLinking'

import Signup from './components/signup/SignupState'
import SigninInfo from './components/signin/SigninInfo'
import Blurred from './components/common/view/Blurred'
import Welcome from './components/auth/login/WelcomeScreen'
import InviteWelcome from './components/inviteWelcome/InviteWelcome'

const generateRouter = () => {
  const { params } = DeepLinking
  const initialRouteName = params.inviteCode ? 'InviteWelcome' : 'Welcome'

  const routes = {
    Welcome,
    InviteWelcome,
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
  return Router
}
export default once(generateRouter())
