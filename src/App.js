// @flow
import React, { Component } from 'react'
import { StyleSheet, View, Platform, SafeAreaView } from 'react-native'
import { Provider as PaperProvider } from 'react-native-paper'
import { WebRouter } from './Router'
import GoodWallet from './lib/wallet/GoodWallet'
import GoodWalletLogin from './lib/login/GoodWalletLogin'
import Splash from './components/splash/Splash'
class App extends Component<{}, { walletReady: boolean, isLoggedIn: boolean, isUserRegistered: boolean }> {
  componentWillMount() {
    //set wallet as global, even though everyone can import the singleton
    global.wallet = GoodWallet
  }

  render() {
    return (
      <PaperProvider>
        <SafeAreaView>
          <View style={styles.container}>
            <WebRouter />
          </View>
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
