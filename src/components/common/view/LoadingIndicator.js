// @flow
import React from 'react'
import { ActivityIndicator, Colors, Portal } from 'react-native-paper'
import { View } from 'react-native'
import type { Store } from 'undux'
import { withStyles } from '../../../lib/styles'
import SimpleStore from '../../../lib/undux/SimpleStore'

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

const getStylesFromProps = ({ theme }) => {
  let backgroundColor = 'transparent'

  if (theme && theme.modals && theme.modals.activityIndicatorBackgroundColor) {
    backgroundColor = theme.modals.activityIndicatorBackgroundColor
  }

  return {
    screen: {
      position: 'absolute',
      top: 0,
      left: 0,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      width: '100%',
      height: '100%',
      backgroundColor,
    },
  }
}

export const Spinner = ({ loading }) => <ActivityIndicator animating={loading} color={Colors.lightBlue800} />

export const Indicator = withStyles(getStylesFromProps)(({ styles, loading }) => (
  <Portal>
    {loading ? (
      <View style={styles.screen}>
        <Spinner loading />
      </View>
    ) : null}
  </Portal>
))

/**
 * Provides a `LoadingIndicator` component which renders an ActivityIndicator over a semi-transparent background.
 * @param {object} props - an object with props
 * @param {boolean} props.force - to force rendering
 * @returns {React.Node}
 * @constructor
 */
const LoadingIndicator = ({ force }) => {
  const store = SimpleStore.useStore()
  const loading = store.get('loadingIndicator').loading || force
  return <Indicator loading={loading} />
}

const suspenseWithIndicator = (child, props) => {
  const Child = React.lazy(() => child)
  const Loading = <Indicator loading={true} />
  return (
    <React.Suspense fallback={Loading}>
      <Child {...props} />
    </React.Suspense>
  )
}
export { LoadingIndicator as default, suspenseWithIndicator }
