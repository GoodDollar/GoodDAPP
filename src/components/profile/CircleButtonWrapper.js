// @flow
import React from 'react'
import { TouchableOpacity } from 'react-native'
import { withStyles } from '../../lib/styles'
import { Icon } from '../common'

const CircleButtonWrapper = props => {
  const { onPress, disabled, styles, style, iconName, iconColor = '#fff', iconSize = 20 } = props

  return (
    <TouchableOpacity
      cursor={disabled ? 'inherit' : 'pointer'}
      onPress={disabled ? undefined : onPress}
      style={[styles.button, style]}
    >
      <Icon color={iconColor} size={iconSize} name={iconName} />
    </TouchableOpacity>
  )
}

const getStylesFromProps = ({ theme }) => ({
  button: {
    alignItems: 'center',
    backgroundColor: theme.colors.darkBlue,
    borderRadius: 21,
    display: 'flex',
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
})

export default withStyles(getStylesFromProps)(CircleButtonWrapper)
