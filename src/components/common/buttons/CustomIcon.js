// @flow
import React from 'react'
import { View } from 'react-native'
import Icon from '../view/Icon'
import { withStyles } from '../../../lib/styles'

const CustomIcon = ({ styles, theme, name, color, size, circleSize = 16, reverse, reverseColor }) => (
  <View
    style={[
      styles.imageIcon,
      {
        width: circleSize,
        height: circleSize,
        borderRadius: circleSize / 2,
        backgroundColor: reverse ? color : reverseColor,
      },
    ]}
  >
    <Icon name={name} size={size} color={theme.colors.surface} />
  </View>
)

const getStylesFromProps = ({ theme, size }) => ({
  imageIcon: {
    justifyContent: 'center',
    alignItems: 'center',
  },
})

export default withStyles(getStylesFromProps)(CustomIcon)
