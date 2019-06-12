// @flow
import React from 'react'
import { AsyncStorage } from 'react-native'
import { Platform, SafeAreaView, StyleSheet, View } from 'react-native'
import PaperProvider from 'react-native-paper/src/core/Provider'
// import { loadReCaptcha } from 'recaptcha-v3-react'
// import GDStore from './lib/undux/GDStore'
// import { WebRouter } from './Router'
import Splash from './components/splash/Splash'

const App = () => {
  // let walletAndStorageReady = import(/* webpackChunkName: "init-wallet-storage" */ './init').then(({ init, _ }) =>
  //   init()
  // )
  // let router = import(/* webpackChunkName: "router" */ './Router')
  // const Signup = props => suspenseWithIndicator(import('./components/signup/SignupState'), props)
  let signupRouter = import(/* webpackChunkName: "signuprouter" */ './SignupRouter')
  let isLoggedIn = AsyncStorage.getItem('GD_USER_MNEMONIC').then(_ => _ !== undefined)
  //if not logged in dont wait for wallet/storage to be ready
  let Router = React.lazy(async () => {
    // if (await isLoggedIn) await walletAndStorageReady
    return signupRouter
  })
  // onRecaptcha = (token: string) => {
  //   userStorage.setProfileField('recaptcha', token, 'private')
  // }
  return (
    // <GDStore.Container>
    <PaperProvider>
      <SafeAreaView>
        <View style={styles.container}>
          {/* <ReCaptcha sitekey={Config.recaptcha} action="auth" verifyCallback={this.onRecaptcha} /> */}
          <React.Suspense fallback={<Splash />}>
            <Router isLoggedIn />
          </React.Suspense>
        </View>
      </SafeAreaView>
    </PaperProvider>
    // </GDStore.Container>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
    margin: 0,
    padding: 0,
    position: 'fixed',
    maxWidth: '1024px',
    alignSelf: 'center',
    backgroundColor: '#fff'
  }
})

let hotWrapper = () => () => App
if (Platform.OS === 'web') {
  const { hot } = require('react-hot-loader')
  hotWrapper = hot
}
//$FlowFixMe
export default hotWrapper(module)(App)
