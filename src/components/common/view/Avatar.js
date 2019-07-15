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
export default (props: AvatarProps) => (
  <TouchableOpacity
    activeOpacity={0.5}
    disabled={!props.onPress}
    onPress={props.onPress}
    style={[styles.avatarContainer, props.style]}
    underlayColor="#fff"
  >
    <Avatar.Image
      size={42}
      source={props.source ? { uri: props.source } : undefined}
      {...props}
      style={[styles.avatar, props.style]}
    />
    {props.children}
  </TouchableOpacity>
)

const styles = StyleSheet.create({
  avatarContainer: {
    backgroundColor: 'rgba(0,0,0,0)',
  },
  avatar: {
    backgroundColor: '#eee',
  },
})
