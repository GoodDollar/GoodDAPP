// @flow
import React from 'react'
import { View } from 'react-native'
import { withStyles } from '../../../lib/styles'
import SimpleStore from '../../../lib/undux/SimpleStore'

const Wrapper = props => {
  const simpleStore = SimpleStore.useStore()
  const shouldGrow = simpleStore.get && !simpleStore.get('isMobileSafariKeyboardShown')

  const growStyle = { flexGrow: shouldGrow ? 1 : 0 }

  const { backgroundColor, children, style, styles, ...rest } = props
  const backgroundStyle = backgroundColor ? { backgroundColor } : {}

  return (
    <View data-name="viewWrapper" style={[styles.container, backgroundStyle, growStyle, style]} {...rest}>
      {children}
    </View>
  )
}

const getStylesFromProps = ({ theme }) => {
  return {
    container: {
      display: 'flex',
      flexGrow: 1,
      flexDirection: 'column',
      padding: theme.paddings.mainContainerPadding,
      width: '100%',
      position: 'relative',
    },
  }
}

export default withStyles(getStylesFromProps)(Wrapper)
