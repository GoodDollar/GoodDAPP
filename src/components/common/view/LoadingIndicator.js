// @flow
import React from 'react'
import { ActivityIndicator, Colors, Portal } from 'react-native-paper'
import { StyleSheet, View } from 'react-native-web'
import type { Store } from 'undux'

import GDStore from '../../../lib/undux/GDStore'

/**
 * Curried function wich requires an undux Store and then sets the flag to show/hide the LoadingIndicator component
 * @param {Store} store - undux store
 * @returns {function(to:boolean): void}  Sets `loading` to what `to` states. It requires `loadingIndicator` to be set in the Store's state
 */
export const setLoadingWithStore = (store: Store) => (to: boolean) => {
  const loadingIndicator = store.get('loadingIndicator')

  loadingIndicator.loading = to
  store.set('loadingIndicator')(loadingIndicator)
}

/**
 * Provides a `LoadingIndicator` component which renders an ActivityIndicator over a semi-transparent background.
 * @param {object} props - an object with props
 * @param {boolean} props.force - to force rendering
 * @returns {React.Node}
 * @constructor
 */
const LoadingIndicator = ({ force }) => {
  const store = GDStore.useStore()
  const loading = store.get('loadingIndicator').loading || force
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
