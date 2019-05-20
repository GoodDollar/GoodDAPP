// @flow
import React from 'react'
import { StyleSheet, TouchableOpacity } from 'react-native'
import { Avatar as PaperAvatar } from 'react-native-paper'

export type AvatarProps = {
  onPress?: () => {},
  source?: string,
  style?: {},
  size?: number
}

/**
 * Touchable Avatar
 * @param {props} AvatarProps
 */
const Avatar = (props: AvatarProps) => (
  <TouchableOpacity
    onPress={props.onPress}
    style={props.onPress ? [props.style, styles.clickable] : [props.style, styles.avatarView]}
  >
    <PaperAvatar.Image
      size={34}
      source={props.source ? { uri: props.source } : undefined}
      {...props}
      style={[styles.avatar, props.style]}
    />
  </TouchableOpacity>
)

const styles = StyleSheet.create({
  avatar: {
    backgroundColor: 'white',
    borderColor: '#707070',
    borderWidth: StyleSheet.hairlineWidth
  },
  avatarView: {
    borderRadius: '50%'
  },
  clickable: {
    borderRadius: '50%',
    cursor: 'pointer'
  }
})

export default Avatar
