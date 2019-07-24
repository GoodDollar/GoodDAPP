// @flow
import React from 'react'
import { Platform, StyleSheet, View } from 'react-native'
import PaperProvider from 'react-native-paper/src/core/Provider'
import { theme } from './components/theme/styles'
import SimpleStore from './lib/undux/SimpleStore'
import RouterSelector from './RouterSelector'
import { SimpleStoreDialog } from './components/common/dialogs/CustomDialog'
import LoadingIndicator from './components/common/view/LoadingIndicator'

const App = () => {
  // onRecaptcha = (token: string) => {
  //   userStorage.setProfileField('recaptcha', token, 'private')
  // }

  return (
    <SimpleStore.Container>
      <PaperProvider theme={theme}>
        <View style={styles.safeAreaView}>
          <React.Fragment>
            <SimpleStoreDialog />
            <LoadingIndicator />
            {/* <ReCaptcha sitekey={Config.recaptcha} action="auth" verifyCallback={this.onRecaptcha} /> */}
            <RouterSelector />
          </React.Fragment>
        </View>
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
