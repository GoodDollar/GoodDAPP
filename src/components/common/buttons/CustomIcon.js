// @flow
import React from 'react'
import { Platform, View } from 'react-native'
import Icon from '../view/Icon'
import { withStyles } from '../../../lib/styles'

const CustomIcon = ({ styles, theme, name, color, size, reverse, reverseColor }) => (
  <View style={[styles.imageIcon, { backgroundColor: reverse ? color : reverseColor }]}>
    <Icon name={name} size={size} color={theme.colors.surface} />
  </View>
)

const getStylesFromProps = ({ theme, size }) => ({
  imageIcon: {
    borderRadius: Platform.select({
      default: size / 2,
      web: '50%',
    }),
    padding: theme.sizes.defaultDouble,
  },
})

export default withStyles(getStylesFromProps)(CustomIcon)
