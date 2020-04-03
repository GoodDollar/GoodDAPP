// @flow
import React, { useMemo } from 'react'
import { Image, View } from 'react-native'
import { isMobileOnly } from 'mobile-device-detect'
import { withStyles } from '../../../lib/styles'
import { getScreenHeight } from '../../../lib/utils/Orientation'
import wrapperClaimBackgroundImage from '../../../assets/wrapperClaim.svg'
import SimpleStore from '../../../lib/undux/SimpleStore'
Image.prefetch(wrapperClaimBackgroundImage)

const sizeFactor = isMobileOnly ? 2.5 : 2.4
const screenHeight = getScreenHeight()

const backgroundImage = {
  backgroundImage: `url(${wrapperClaimBackgroundImage})`,
  backgroundPosition: 'center top',
  backgroundSize: `${screenHeight - screenHeight / sizeFactor}px`,
  backgroundRepeat: 'no-repeat',
  marginTop: '-3px',
}

const WrapperClaim = ({ backgroundColor, children, style, styles, ...props }) => {
  const { container } = styles
  const simpleStore = SimpleStore.useStore()
  const shouldGrow = !simpleStore.get('isMobileSafariKeyboardShown')

  const wrapperStyles = useMemo(() => {
    const growStyle = { flexGrow: shouldGrow ? 1 : 0 }
    const backgroundStyle = backgroundColor ? { backgroundColor } : backgroundImage

    return [container, backgroundStyle, growStyle, style]
  }, [shouldGrow, backgroundColor, container, style])

  return (
    <View data-name="viewWrapper" style={wrapperStyles} {...props}>
      {children}
    </View>
  )
}

const getStylesFromProps = ({ theme }) => {
  let styles = {
    container: {
      width: '100%',
    },
  }
  if (!isMobileOnly) {
    styles.container = { ...styles.container, maxHeight: theme.sizes.maxHeightForTabletAndDesktop }
  }
  return styles
}

export default withStyles(getStylesFromProps)(WrapperClaim)
