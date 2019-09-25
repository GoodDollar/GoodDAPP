// @flow
import React from 'react'
import { View } from 'react-native'
import { isMobileOnly } from 'mobile-device-detect'
import { withStyles } from '../../../lib/styles'
import SimpleStore from '../../../lib/undux/SimpleStore'

const Wrapper = props => {
  const simpleStore = SimpleStore.useStore()
  const shouldGrow = simpleStore.get && !simpleStore.get('isMobileSafariKeyboardShown')

  const growStyle = { flexGrow: shouldGrow ? 1 : 0 }

  const { backgroundColor, children, style, styles, ...rest } = props
  const backgroundStyle = backgroundColor
    ? { backgroundColor: backgroundColor }
    : {
        backgroundImage:
          'linear-gradient(to bottom, #00AFFF, #2DC0F7, #28C0EF, #23C0E7, #1EC1DF, #19C1D7, #14C1CF, #0FC2C7, #0FC2C7, #0AC2BF, #05C2B7, #00C3AF)',
      }

  return (
    <View data-name="viewWrapper" style={[styles.container, backgroundStyle, growStyle, style]} {...rest}>
      {children}
    </View>
  )
}

const getStylesFromProps = ({ theme }) => {
  let styles = {
    container: {
      display: 'flex',
      flexGrow: 1,
      flexDirection: 'column',
      padding: theme.paddings.mainContainerPadding,
      width: '100%',
      position: 'relative',
    },
  }
  if (!isMobileOnly) {
    styles.container = { ...styles.container, maxHeight: theme.sizes.maxHeightForTabletAndDesktop }
  }
  return styles
}

export default withStyles(getStylesFromProps)(Wrapper)
