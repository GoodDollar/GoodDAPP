// @flow
import React, { useMemo } from 'react'
import { Platform, View } from 'react-native'
import { isMobileOnlyNative } from '../../../lib/utils/platform'
import { withStyles } from '../../../lib/styles'
import { theme } from '../../../components/theme/styles'
import SimpleStore from '../../../lib/undux/SimpleStore'
import { getDesignRelativeHeight, getMaxDeviceWidth } from '../../../lib/utils/sizes'

const borderSize = Platform.select({ web: '50%', default: (getMaxDeviceWidth() * 1.5) / 2 })
const backgroundGradientStyles = {
  position: 'absolute',
  width: '180%',
  height: getDesignRelativeHeight(415),
  borderBottomLeftRadius: borderSize,
  borderBottomRightRadius: borderSize,
  left: '-40%',
  backgroundColor: theme.colors.primary,
}

const WrapperClaim = ({ children, style, styles, ...props }) => {
  const { container } = styles
  const simpleStore = SimpleStore.useStore()
  const shouldGrow = !simpleStore.get('isMobileSafariKeyboardShown')

  const wrapperStyles = useMemo(() => {
    const growStyle = { flexGrow: shouldGrow ? 1 : 0 }
    return [container, growStyle, style]
  }, [shouldGrow, container, style])

  return (
    <View dataSet={{ name: 'viewWrapper' }} style={wrapperStyles} {...props}>
      <View style={backgroundGradientStyles} />
      {children}
    </View>
  )
}

const getStylesFromProps = ({ theme }) => {
  let styles = {
    container: {
      width: '100%',
      position: 'relative',
      maxHeight: theme.sizes.maxContentHeightForTabletAndDesktop,
    },
  }
  if (isMobileOnlyNative) {
    styles.container = {}
  }
  return styles
}

export default withStyles(getStylesFromProps)(WrapperClaim)
