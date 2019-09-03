// @flow
import React from 'react'
import { Platform, SafeAreaView, StyleSheet } from 'react-native'
import PaperProvider from 'react-native-paper/src/core/Provider'
import AddToHomescreen from 'react-add-to-homescreen'
import { theme } from './components/theme/styles'
import SimpleStore from './lib/undux/SimpleStore'
import RouterSelector from './RouterSelector'
import { SimpleStoreDialog } from './components/common/dialogs/CustomDialog'
import LoadingIndicator from './components/common/view/LoadingIndicator'

const App = () => {
  // onRecaptcha = (token: string) => {
  //   userStorage.setProfileField('recaptcha', token, 'private')
  // }
  const handleAddToHomescreenClick = () => {
    alert(`
      1. Open Share menu
      2. Tap on "Add to Home Screen" button`)
  }

  return (
    <SimpleStore.Container>
      <PaperProvider theme={theme}>
        <SafeAreaView style={styles.safeAreaView}>
          <React.Fragment>
            <SimpleStoreDialog />
            <LoadingIndicator />
            {/* <ReCaptcha sitekey={Config.recaptcha} action="auth" verifyCallback={this.onRecaptcha} /> */}
            <RouterSelector />
            <AddToHomescreen onAddToHomescreenClick={handleAddToHomescreenClick} />
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
