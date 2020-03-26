// @flow
import React from 'react'
import { TouchableWithoutFeedback, View } from 'react-native'
import ScrollToTopSVG from '../../../assets/scrollToTop.svg'
import { withStyles } from '../../../lib/styles'

const ScrollToTopButton = ({ onPress, styles, style }) => (
  <TouchableWithoutFeedback onPress={onPress}>
    <View style={[styles.scrollToTopImage, style]}>
      <ScrollToTopSVG />
    </View>
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
