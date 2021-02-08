// @flow
import React from 'react'
import { TouchableOpacity, View } from 'react-native'
import ScrollToTopSVG from '../../../assets/scrollToTop.svg'
import Fade from '../animations/Fade'
import { withStyles } from '../../../lib/styles'
import useOnPress from '../../../lib/hooks/useOnPress'

const ScrollToTopButton = ({ onPress, styles, style, show }) => {
  const _onPress = useOnPress(onPress)
  return (
    <View style={[styles.scrollToTopImage, style]}>
      <Fade show={show}>
        <TouchableOpacity onPress={_onPress}>
          <ScrollToTopSVG />
        </TouchableOpacity>
      </Fade>
    </View>
  )
}

const getStylesFromProps = () => ({
  scrollToTopImage: {
    width: 74,
    height: 74,
    position: 'absolute',
    bottom: 0,
    right: 0,
    zIndex: 1000,
  },
})

export default withStyles(getStylesFromProps)(ScrollToTopButton)
