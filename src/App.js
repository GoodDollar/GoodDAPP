// @flow
import React, { Component } from 'react'
import { StyleSheet, View, Platform, SafeAreaView } from 'react-native'
import { Provider as PaperProvider } from 'react-native-paper'
import { WebRouter } from './Router'
import GoodWallet from './lib/wallet/GoodWallet'
import GoodWalletLogin from './lib/login/GoodWalletLogin'
import Splash from './components/splash/Splash'

function delay(t, v) {
  return new Promise(function(resolve) {
    setTimeout(resolve.bind(null, v), t)
  })
}
const TIMEOUT = 1000
class App extends Component<{}, { walletReady: boolean, isLoggedIn: boolean, isUserRegistered: boolean }> {
  state = {
    walletReady: false,
    isLoggedIn: false,
    isUserRegistered: false
  }

  componentWillMount() {
    //set wallet as global, even though everyone can import the singleton
    global.wallet = GoodWallet
    //when wallet is ready perform login to server (sign message with wallet and send to server)
    Promise.all([GoodWallet.ready.then(() => GoodWalletLogin.auth()), delay(TIMEOUT)]).then(([credsOrError]) => {
      this.setState({ walletReady: true, isLoggedIn: credsOrError.jwt !== undefined })
    })
  }

  render() {
    return (
      <PaperProvider>
        <SafeAreaView>
          <View style={styles.container}>{this.state.walletReady ? <WebRouter /> : <Splash />}</View>
        </SafeAreaView>
      </PaperProvider>
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
export default hotWrapper(module)(App)
