// @flow
import React, { useContext, useMemo } from 'react'
import { Platform, View } from 'react-native'
import { isMobileOnlyNative } from '../../../lib/utils/platform'
import { withStyles } from '../../../lib/styles'
import { theme } from '../../../components/theme/styles'
import { getDesignRelativeHeight, getMaxDeviceWidth } from '../../../lib/utils/sizes'
import { GlobalTogglesContext } from '../../../lib/contexts/togglesContext'

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

  const { isMobileSafariKeyboardShown } = useContext(GlobalTogglesContext)

  const wrapperStyles = useMemo(() => {
    const growStyle = { flexGrow: isMobileSafariKeyboardShown ? 1 : 0 }
    return [container, growStyle, style]
  }, [isMobileSafariKeyboardShown, container, style])

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
