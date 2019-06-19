// @flow
import React from 'react'
import { Platform, SafeAreaView, StyleSheet, View } from 'react-native'
import PaperProvider from 'react-native-paper/src/core/Provider'

// import { loadReCaptcha } from 'recaptcha-v3-react'
import SimpleStore from './lib/undux/SimpleStore'
import RouterSelector from './RouterSelector'
import { SimpleStoreDialog } from './components/common/CustomDialog'
import LoadingIndicator from './components/common/LoadingIndicator'

const App = () => {
  // onRecaptcha = (token: string) => {
  //   userStorage.setProfileField('recaptcha', token, 'private')
  // }
  return (
    <SimpleStore.Container>
      <PaperProvider>
        <SafeAreaView>
          <View style={styles.container}>
            <SimpleStoreDialog />
            <LoadingIndicator />
            {/* <ReCaptcha sitekey={Config.recaptcha} action="auth" verifyCallback={this.onRecaptcha} /> */}
            <RouterSelector />
          </View>
        </SafeAreaView>
      </PaperProvider>
    </SimpleStore.Container>
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
