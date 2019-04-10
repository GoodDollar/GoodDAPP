// @flow
import React from 'react'
import { ActivityIndicator, Colors, Portal } from 'react-native-paper'
import { StyleSheet, View } from 'react-native-web'
import type { Store } from 'undux'

import GDStore from '../../lib/undux/GDStore'

export const setLoadingWithStore = (store: Store) => (to: boolean) => {
  const loadingIndicator = store.get('loadingIndicator')

  loadingIndicator.loading = to
  store.set('loadingIndicator')(loadingIndicator)
}

const LoadingIndicator = () => {
  const store = GDStore.useStore()
  const { loading } = store.get('loadingIndicator')

  return (
    <Portal>
      {loading ? (
        <View style={styles.screen}>
          <ActivityIndicator animating={loading} color={Colors.lightBlue800} />
        </View>
      ) : null}
    </Portal>
  )
}

const styles = StyleSheet.create({
  screen: {
    position: 'absolute',
    top: 0,
    left: 0,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.8)'
  }
})

export default LoadingIndicator
