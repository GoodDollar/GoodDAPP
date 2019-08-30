// @flow
import React, { useEffect, useState } from 'react'
import { ScrollView, StyleSheet, View } from 'react-native'
import { createSwitchNavigator } from '@react-navigation/core'
import { isMobileSafari } from 'mobile-device-detect'

import NavBar from '../appNavigation/NavBar'
import { navigationConfig } from '../appNavigation/navigationConfig'
import logger from '../../lib/logger/pino-logger'

import SimpleStore from '../../lib/undux/SimpleStore'
import SigninInfo from './SigninInfo'
import Mnemonics from './Mnemonics'
const log = logger.child({ from: 'SignInState' })

type Ready = Promise<{ goodWallet: any, userStorage: any }>

const SigninWizardNavigator = createSwitchNavigator(
  {
    SigninInfo,
    Mnemonics,
  },
  navigationConfig
)

const Signin = ({ navigation, screenProps }: { navigation: any, screenProps: any }) => {
  const store = SimpleStore.useStore()
  const [ready, setReady]: [Ready, ((Ready => Ready) | Ready) => void] = useState()
  const shouldGrow = store.get && !store.get('isMobileSafariKeyboardShown')

  const navigateWithFocus = (routeKey: string) => {
    navigation.navigate(routeKey)
    if (isMobileSafari || routeKey === 'Phone') {
      setTimeout(() => {
        const el = document.getElementById(routeKey + '_input')
        if (el) {
          el.focus()
        }
      }, 300)
    }
  }
  useEffect(() => {
    //don't allow to start signup flow not from begining
    if (navigation.state.index > 0) {
      log.debug('redirecting to start, got index:', navigation.state.index)
      return navigateWithFocus(navigation.state.routes[0].key)
    }

    setReady(ready)
  }, [])

  const back = () => {
    const nextRoute = navigation.state.routes[navigation.state.index - 1]
    if (nextRoute) {
      navigateWithFocus(nextRoute.key)
    } else {
      navigation.navigate('Auth')
    }
  }

  const { scrollableContainer, contentContainer } = styles

  return (
    <View style={{ flexGrow: shouldGrow ? 1 : 0 }}>
      <NavBar goBack={back} title={'Sign Up'} />
      <ScrollView contentContainerStyle={scrollableContainer}>
        <View style={contentContainer}>
          <SigninWizardNavigator
            navigation={navigation}
            screenProps={{
              ...screenProps,
              back,
            }}
          />
        </View>
      </ScrollView>
    </View>
  )
}

Signin.router = SigninWizardNavigator.router
Signin.navigationOptions = SigninWizardNavigator.navigationOptions

const styles = StyleSheet.create({
  contentContainer: {
    flexGrow: 1,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  scrollableContainer: {
    flexGrow: 1,
  },
})

export default Signin
