// @flow
import React, { useMemo } from 'react'
import { Image, View } from 'react-native'
import { isMobile, isMobileOnly } from 'mobile-device-detect'
import { withStyles } from '../../../lib/styles'
import { getScreenHeight } from '../../../lib/utils/Orientation'
import wrapperClaimBackgroundImage from '../../../assets/wrapperClaim.svg'
import SimpleStore from '../../../lib/undux/SimpleStore'
Image.prefetch(wrapperClaimBackgroundImage)

const sizeFactor = isMobile ? 2.7 : 1.9
const screenHeight = getScreenHeight()

const backgroundImage = {
  backgroundImage: `url(${wrapperClaimBackgroundImage})`,
  backgroundPosition: 'center top',
  backgroundSize: `${screenHeight - screenHeight / sizeFactor}px`,
  backgroundRepeat: 'no-repeat',
  marginTop: '-3px',
}

const wrapperClaim = props => {
  const simpleStore = SimpleStore.useStore()
  const shouldGrow = simpleStore && !simpleStore.get('isMobileSafariKeyboardShown')

  const growStyle = { flexGrow: shouldGrow ? 1 : 0 }

  const { backgroundColor, children, style, styles, ...rest } = props

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const backgroundStyle = useMemo(() => {
    return backgroundColor ? { backgroundColor: backgroundColor } : backgroundImage
  }, [backgroundColor])

  return (
    <View data-name="viewWrapper" style={[styles.container, backgroundStyle, growStyle, style]} {...rest}>
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

export default withStyles(getStylesFromProps)(wrapperClaim)
