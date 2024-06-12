// @flow
import React, { useContext } from 'react'
import { isFunction } from 'lodash'
import { ActivityIndicator, Colors, Portal } from 'react-native-paper'
import { View } from 'react-native'
import { withStyles } from '../../../lib/styles'
import { GlobalTogglesContext } from '../../../lib/contexts/togglesContext'

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

export const Spinner = ({ loading, ...props }) => (
  <ActivityIndicator {...props} animating={loading} color={Colors.lightBlue800} />
)

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
  const { isLoadingIndicator } = useContext(GlobalTogglesContext)
  const loading = isLoadingIndicator || force
  return <Indicator loading={loading} />
}

const suspenseWithIndicator = child => props => {
  const Child = React.lazy(() => (isFunction(child) ? child() : child))
  const Loading = <Indicator loading={true} />

  return (
    <React.Suspense fallback={Loading}>
      <Child {...props} />
    </React.Suspense>
  )
}

export { LoadingIndicator as default, suspenseWithIndicator }
