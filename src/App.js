// @flow
import React, { Component } from 'react';
import {
  StyleSheet,
  View,
  Platform,
  Animated,
  Easing,
  SafeAreaView,
  Dimensions
} from 'react-native';
import { Provider as PaperProvider } from 'react-native-paper';
import {WebRouter} from "./Router"
import GoodWallet from "./lib/wallet/GoodWallet"
import logo from './logo.png';
import GoodWalletLogin from "./lib/login/GoodWalletLogin"
class App extends Component<{},{walletReady:boolean, spinValue:any, isLoggedIn:boolean, isUserRegistered: boolean}> {
  state = {
    spinValue: new Animated.Value(0.5),
    walletReady:false,
    isLoggedIn:false,
    isUserRegistered:false
  }

  componentWillMount() {
    //set wallet as global, even though everyone can import the singleton
    global.wallet = GoodWallet
    //when wallet is ready perform login to server (sign message with wallet and send to server)
    GoodWallet.ready
      .then(() => GoodWalletLogin.auth() )
      .then((credsOrError) => {
        this.setState({walletReady:true,isLoggedIn:credsOrError.jwt!==undefined})      
      })
  }

  render() {
    const spin = this.state.spinValue.interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', '360deg']
    });
    return (
      <PaperProvider >
      <SafeAreaView style={{flex: 1, backgroundColor: '#fff'}}>
        <View style={styles.container}>
          {this.state.walletReady?
            <WebRouter/> :
            <Animated.Image source={logo} style={[styles.logo, { transform: [{rotate: spin}] }]}/>}
        </View>
      </SafeAreaView>
    </PaperProvider>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
    margin: 0,
    padding: 0,
    position:'fixed',
    maxWidth:'1024px',
    // left: '50%',
    // transform:[{ translateX: - Dimensions.get('window').width * 0.24 }]
    // transform:[{ translateX: - 1024 * 0.24 }]
    },
  logo: {
    width: 300,
    height: 300,
  },
});

let hotWrapper = () => () => App;
if (Platform.OS === 'web') {
  const { hot } = require('react-hot-loader');
  hotWrapper = hot;
}
export default hotWrapper(module)(App);
