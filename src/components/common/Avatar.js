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

export default (props: AvatarProps) => (
  <TouchableOpacity
    onClick={props.onPress}
    style={props.onPress ? [props.style, styles.clickable] : [props.style, styles.avatarView]}
  >
    <Avatar.Image
      size={34}
      source={props.source ? { uri: props.source } : undefined}
      {...props}
      style={[styles.avatar, props.style]}
    />
  </TouchableOpacity>
)

const styles = StyleSheet.create({
  avatar: {
    backgroundColor: 'white'
  },
  avatarView: {
    borderRadius: '50%'
  },
  clickable: {
    borderRadius: '50%',
    cursor: 'pointer'
  }
})
