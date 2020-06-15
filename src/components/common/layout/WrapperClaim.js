// @flow
import React, { useMemo } from 'react'
import { View } from 'react-native'
import { isMobileOnly } from '../../../lib/utils/platform'
import { withStyles } from '../../../lib/styles'
import SimpleStore from '../../../lib/undux/SimpleStore'

const backgroundGradientStyles = {
  position: 'absolute',
  width: '200%',
  height: '74%',
  borderBottomLeftRadius: '50%',
  borderBottomRightRadius: '50%',
  right: '-50%',
  backgroundImage:
    'linear-gradient(to bottom, #00AFFF, #2DC0F7, #28C0EF, #23C0E7, #1EC1DF, #19C1D7, #14C1CF, #0FC2C7, #0FC2C7, #0AC2BF, #05C2B7, #00C3AF)',
}

const backgroundLineStyles = {
  position: 'absolute',
  height: '100%',
  width: '100%',
  top: -5,
  borderBottomWidth: 3,
  borderBottomColor: 'white',
  borderStyle: 'solid',
  borderBottomLeftRadius: '50%',
  borderBottomRightRadius: '50%',
}

const WrapperClaim = ({ backgroundColor, children, style, styles, ...props }) => {
  const { container } = styles
  const simpleStore = SimpleStore.useStore()
  const shouldGrow = !simpleStore.get('isMobileSafariKeyboardShown')

  const wrapperStyles = useMemo(() => {
    const growStyle = { flexGrow: shouldGrow ? 1 : 0 }
    const backgroundStyle = backgroundColor ? { backgroundColor } : {}

    return [container, backgroundStyle, growStyle, style]
  }, [shouldGrow, backgroundColor, container, style])

  return (
    <View data-name="viewWrapper" style={wrapperStyles} {...props}>
      {!backgroundColor && (
        <View style={backgroundGradientStyles}>
          <View style={backgroundLineStyles} />
        </View>
      )}
      {children}
    </View>
  )
}

const getStylesFromProps = ({ theme }) => {
  let styles = {
    container: {
      width: '100%',
      position: 'relative',
    },
  }
  if (!isMobileOnly) {
    styles.container = { ...styles.container, maxHeight: theme.sizes.maxHeightForTabletAndDesktop }
  }
  return styles
}

export default withStyles(getStylesFromProps)(WrapperClaim)
