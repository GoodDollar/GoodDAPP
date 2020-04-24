// @flow
import React from 'react'
import { TouchableWithoutFeedback, View } from 'react-native'
import ScrollToTopSVG from '../../../assets/scrollToTop.svg'
import Fade from '../animations/Fade'
import { withStyles } from '../../../lib/styles'

const ScrollToTopButton = ({ onPress, styles, style, show }) => (
  <Fade show={show}>
    <TouchableWithoutFeedback onPress={onPress}>
      <View style={[styles.scrollToTopImage, style]}>
        <ScrollToTopSVG />
      </View>
    </TouchableWithoutFeedback>
  </Fade>
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
