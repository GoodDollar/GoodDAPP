// @flow
import React, { Component } from 'react'
import { Platform, SafeAreaView, StyleSheet, View } from 'react-native'
import { Provider as PaperProvider } from 'react-native-paper'
// import { loadReCaptcha } from 'recaptcha-v3-react'

import Config from './config/config'
import userStorage from './lib/gundb/UserStorage'
import logger from './lib/logger/pino-logger'
import GDStore from './lib/undux/GDStore'
import { WebRouter } from './Router'

class App extends Component<{}, { walletReady: boolean, isLoggedIn: boolean, isUserRegistered: boolean }> {
  componentWillMount() {
    //set wallet as global, even though everyone can import the singleton
    // loadReCaptcha({
    //   key: Config.recaptcha,
    //   id: 'uniqueId'
    // })
    //   .then(id => {
    //     logger.log('ReCaptcha loaded', id)
    //   })
    //   .catch((e, id) => {
    //     logger.error('Error when load ReCaptcha', id, e)
    //   })
  }

  // onRecaptcha = (token: string) => {
  //   userStorage.setProfileField('recaptcha', token, 'private')
  // }
  render() {
    return (
      <GDStore.Container>
        <PaperProvider>
          <SafeAreaView>
            <View style={styles.container}>
              {/* <ReCaptcha sitekey={Config.recaptcha} action="auth" verifyCallback={this.onRecaptcha} /> */}
              <WebRouter />
            </View>
          </SafeAreaView>
        </PaperProvider>
      </GDStore.Container>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
    margin: 0,
    padding: 0,
    position: 'fixed',
    maxWidth: '475px',
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
