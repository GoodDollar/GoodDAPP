// @flow
import React, { useMemo } from 'react'
import { Platform, View } from 'react-native'
import { isMobileOnly } from '../../../lib/utils/platform'
import { withStyles } from '../../../lib/styles'
import { theme } from '../../../components/theme/styles'
import SimpleStore from '../../../lib/undux/SimpleStore'
import { getDesignRelativeHeight, getMaxDeviceWidth } from '../../../lib/utils/sizes'

const borderSize = Platform.select({ web: '50%', default: getMaxDeviceWidth() / 2 })
const backgroundGradientStyles = {
  position: 'absolute',
  width: '200%',
  height: getDesignRelativeHeight(440),
  borderBottomLeftRadius: borderSize,
  borderBottomRightRadius: borderSize,
  right: '-50%',
  background: theme.colors.primary,
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
      {!backgroundColor && <View style={backgroundGradientStyles} />}
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
