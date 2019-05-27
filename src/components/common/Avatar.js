// @flow
import React from 'react'
import { StyleSheet, TouchableOpacity } from 'react-native'
import { Avatar } from 'react-native-paper'

export type AvatarProps = {
  onPress?: () => {},
  source?: string,
  style?: {},
  size?: number
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
  <TouchableOpacity onPress={props.onPress} style={[styles.avatarContainer, props.style]} disabled={!props.onPress}>
    <Avatar.Image
      size={34}
      source={props.source ? { uri: props.source } : undefined}
      {...props}
      style={[styles.avatar, props.style]}
    />
  </TouchableOpacity>
)

const styles = StyleSheet.create({
  avatarContainer: {
    backgroundColor: 'rgba(0,0,0,0)'
  },
  avatar: {
    backgroundColor: 'white',
    borderColor: '#707070',
    borderWidth: StyleSheet.hairlineWidth
  }
})
