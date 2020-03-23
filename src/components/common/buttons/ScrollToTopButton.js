// @flow
import React from 'react'
import { Image, Platform, TouchableWithoutFeedback } from 'react-native'
import scrollToTop from '../../../assets/scrollToTop.svg'
import { withStyles } from '../../../lib/styles'
import Fade from '../animations/Fade'

if (Platform.OS === 'web') {
  Image.prefetch(scrollToTop)
}

const ScrollToTopButton = ({ onPress, styles, style, show }) => {
  return (
    <Fade show={show}>
      <TouchableWithoutFeedback onPress={onPress}>
        <Image source={scrollToTop} resizeMode="contain" style={[styles.scrollToTopImage, style]} />
      </TouchableWithoutFeedback>
    </Fade>
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
