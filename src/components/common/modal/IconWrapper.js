// @flow
import React from 'react'
import { View } from 'react-native'
import { withStyles } from '../../../lib/styles'
import Icon from '../view/Icon'

const IconWrapper = ({ styles, style, size, theme, color, iconName }) => (
  <View style={[styles.errorIconContainer, style]}>
    <View style={styles.errorIconFrame}>{<Icon name={iconName} color={color} size={size || 30} />}</View>
  </View>
)

const getStylesFromProps = ({ theme, color }) => ({
  errorIconContainer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: theme.sizes.defaultDouble,
  },
  errorIconFrame: {
    alignItems: 'center',
    borderColor: color,
    borderRadius: '50%',
    borderWidth: 3,
    display: 'flex',
    flexDirection: 'row',
    height: 90,
    justifyContent: 'center',
    width: 90,
  },
})

export default withStyles(getStylesFromProps)(IconWrapper)
