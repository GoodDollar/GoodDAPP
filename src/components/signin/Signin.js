// @flow
import React, { useEffect, useState } from 'react'
import { ScrollView, StyleSheet, View } from 'react-native'
import { createSwitchNavigator } from '@react-navigation/core'

import NavBar from '../appNavigation/NavBar'
import { navigationConfig } from '../appNavigation/navigationConfig'
import logger from '../../lib/logger/pino-logger'

import SigninInfo from './SigninInfo'
import Mnemonics from './Mnemonics'
const log = logger.child({ from: 'Signin' })

type Ready = Promise<{ goodWallet: any, userStorage: any }>

const SigninWizardNavigator = createSwitchNavigator(
  {
    SigninInfo,
    Mnemonics,
  },
  navigationConfig
)

const stepTitle = ['Sign Up', 'recover']

const Signin = ({ navigation, screenProps }: { navigation: any, screenProps: any }) => {
  const [ready, setReady]: [Ready, ((Ready => Ready) | Ready) => void] = useState()
  const navigateWithFocus = (routeKey: string) => {
    navigation.navigate(routeKey)
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
    <View style={{ flexGrow: 1 }}>
      <NavBar goBack={back} title={stepTitle[navigation.state.index]} />
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
