// @flow
import React from 'react'
import { TouchableOpacity, View } from 'react-native'
import { withStyles } from '../../lib/styles'
import { Icon, Text } from '../common'

const CircleButtonWrapper = ({
  label,
  labelStyles,
  onPress,
  disabled,
  styles,
  style,
  containerStyle,
  iconName,
  iconColor,
  iconSize,
}) => (
  <View style={containerStyle}>
    <TouchableOpacity
      cursor={disabled ? 'inherit' : 'pointer'}
      onPress={disabled ? undefined : onPress}
      style={[styles.button, style]}
    >
      <Icon color={iconColor} size={iconSize} name={iconName} />
    </TouchableOpacity>
    {!!label && (
      <Text fontSize={10} fontWeight="500" lineHeight={11} color="white" style={[styles.label, labelStyles]}>
        {label}
      </Text>
    )}
  </View>
)

CircleButtonWrapper.defaultProps = {
  iconColor: '#fff',
  iconSize: 20,
}

const getStylesFromProps = ({ theme }) => ({
  wrapper: {
    display: 'flex',
    alignItems: 'center',
  },
  button: {
    alignItems: 'center',
    backgroundColor: theme.colors.darkBlue,
    borderRadius: 21,
    display: 'flex',
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  label: {
    marginTop: 3,
  },
})

export default withStyles(getStylesFromProps)(CircleButtonWrapper)
