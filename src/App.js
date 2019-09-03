// @flow
import { isMobile } from 'mobile-device-detect'
import React, { useEffect, useState } from 'react'
import { AsyncStorage, Platform, SafeAreaView, StyleSheet } from 'react-native'
import PaperProvider from 'react-native-paper/src/core/Provider'
import { theme } from './components/theme/styles'
import { USE_DESKTOP } from './lib/constants/localStorage'
import SimpleStore from './lib/undux/SimpleStore'
import RouterSelector from './RouterSelector'
import { SimpleStoreDialog } from './components/common/dialogs/CustomDialog'
import LoadingIndicator from './components/common/view/LoadingIndicator'
import SplashDesktop from './components/splash/SplashDesktop'

const App = () => {
  // onRecaptcha = (token: string) => {
  //   userStorage.setProfileField('recaptcha', token, 'private')
  // }
  const [useDesktop, setUseDesktop] = useState()

  const continueWithDesktop = () => {
    AsyncStorage.setItem(USE_DESKTOP, true)
    setUseDesktop(true)
  }

  useEffect(() => {
    const getDesktopFlag = async () => {
      const desktopFlag = JSON.parse(await AsyncStorage.getItem(USE_DESKTOP))
      setUseDesktop(desktopFlag)
    }
    getDesktopFlag()
  }, [])

  return (
    <SimpleStore.Container>
      <PaperProvider theme={theme}>
        <SafeAreaView style={styles.safeAreaView}>
          <React.Fragment>
            <SimpleStoreDialog />
            <LoadingIndicator />
            {/* <ReCaptcha sitekey={Config.recaptcha} action="auth" verifyCallback={this.onRecaptcha} /> */}
            {!isMobile && !useDesktop ? (
              <SplashDesktop onContinue={continueWithDesktop} />
            ) : (
              <RouterSelector usingDesktop={useDesktop} />
            )}
          </React.Fragment>
        </SafeAreaView>
      </PaperProvider>
    </SimpleStore.Container>
  )
}

const styles = StyleSheet.create({
  safeAreaView: {
    flexGrow: 1,
  },
})

let hotWrapper = () => () => App
if (Platform.OS === 'web') {
  const { hot } = require('react-hot-loader')
  hotWrapper = hot
}

//$FlowFixMe
export default hotWrapper(module)(App)
