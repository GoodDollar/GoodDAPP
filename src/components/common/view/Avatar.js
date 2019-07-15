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
      {...props}
      style={[styles.avatar, { width: `${props.size + 2}px`, height: `${props.size + 2}px` }]}
    />
    {props.children}
  </TouchableOpacity>
)

CustomAvatar.defaultProps = {
  size: 34,
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
