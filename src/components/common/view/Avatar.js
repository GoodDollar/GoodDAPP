// @flow
import React from 'react'
import { TouchableOpacity } from 'react-native'
import { Avatar } from 'react-native-paper'
import { withStyles } from '../../../lib/styles'

export type AvatarProps = {
  onPress?: () => {},
  size?: number,
  source?: string,
  style?: {},
  styles?: any,
}

/**
 * Touchable Avatar
 * @param {Props} props
 * @param {Function} [props.onPress]
 * @param {String} [props.source]
 * @param {Object} [props.style]
 * @param {Number} [props.size=34]
 * @returns {React.Node}
 */
const CustomAvatar = (props: AvatarProps) => {
  const { styles } = props

  return (
    <TouchableOpacity
      activeOpacity={0.5}
      disabled={!props.onPress}
      onPress={props.onPress}
      style={[props.style]}
      underlayColor="#fff"
    >
      <Avatar.Image
        size={props.size}
        source={props.source ? { uri: props.source } : undefined}
        style={[styles.avatar, { width: props.size, height: props.size }]}
        {...props}
      />
      {props.children}
    </TouchableOpacity>
  )
}

CustomAvatar.defaultProps = {
  size: 42,
}

const getStylesFromProps = ({ theme }) => ({
  avatar: {
    backgroundColor: theme.colors.gray50Percent,
    borderWidth: 1,
    borderColor: theme.colors.gray80Percent,
  },
})

export default withStyles(getStylesFromProps)(CustomAvatar)
