// @flow
import React from 'react'
import { Image, TouchableWithoutFeedback, Platform } from 'react-native'
import scrollToTop from '../../../assets/scrollToTop.svg'
import { withStyles } from '../../../lib/styles'

if (Platform.OS === 'web') {
  Image.prefetch(scrollToTop)
}

const ScrollToTopButton = ({ onPress, styles, style }) => (
  <TouchableWithoutFeedback onPress={onPress}>
    <Image source={scrollToTop} resizeMode="contain" style={[styles.scrollToTopImage, style]} />
  </TouchableWithoutFeedback>
)

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
