// @flow
import React from 'react'
import { StyleSheet, TouchableOpacity } from 'react-native'
import { Avatar } from 'react-native-paper'

export type AvatarProps = {
  onPress?: () => {},
  source?: string,
  style?: {},
  size?: number,
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
const CustomAvatar = (props: AvatarProps) => (
  <TouchableOpacity
    activeOpacity={0.5}
    disabled={!props.onPress}
    onPress={props.onPress}
    style={[styles.avatarContainer, props.style]}
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

CustomAvatar.defaultProps = {
  size: 42,
}

const styles = StyleSheet.create({
  avatarContainer: {
    backgroundColor: 'rgba(0,0,0,0)',
  },
  avatar: {
    backgroundColor: '#eee',
  },
})

export default CustomAvatar
