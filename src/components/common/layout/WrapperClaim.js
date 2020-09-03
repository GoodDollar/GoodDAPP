// @flow
import React, { useMemo } from 'react'
import { Platform, View } from 'react-native'
import LinearGradient from 'react-native-linear-gradient'
import { isMobileNative, isMobileOnly } from '../../../lib/utils/platform'
import { withStyles } from '../../../lib/styles'
import SimpleStore from '../../../lib/undux/SimpleStore'
import { getScreenWidth } from '../../../lib/utils/orientation'

const gradientColors = [
  '#00AFFF',
  '#2DC0F7',
  '#28C0EF',
  '#23C0E7',
  '#1EC1DF',
  '#19C1D7',
  '#14C1CF',
  '#0FC2C7',
  '#0FC2C7',
  '#0AC2BF',
  '#05C2B7',
  '#00C3AF',
]

const borderSize = Platform.select({ web: '50%', default: getScreenWidth() * 2 })

const backgroundGradientStyles = {
  position: 'absolute',
  width: '200%',
  height: '74%',
  borderBottomLeftRadius: borderSize,
  borderBottomRightRadius: borderSize,
  right: '-50%',
  backgroundImage: `linear-gradient(to bottom, ${gradientColors.join(', ')})`,
}

const backgroundLineStyles = {
  position: 'absolute',
  height: '100%',
  width: '100%',
  top: -5,
  borderBottomWidth: 3,
  borderBottomColor: 'white',
  borderStyle: 'solid',
  borderBottomLeftRadius: borderSize,
  borderBottomRightRadius: borderSize,
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

  let BackgroundContainer = View
  const backgroundContainerProps = { style: backgroundGradientStyles }

  if (isMobileNative) {
    BackgroundContainer = LinearGradient
    backgroundContainerProps.colors = gradientColors
  }

  return (
    <View data-name="viewWrapper" style={wrapperStyles} {...props}>
      {!backgroundColor && (
        <BackgroundContainer {...backgroundContainerProps}>
          <View style={backgroundLineStyles} />
        </BackgroundContainer>
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
