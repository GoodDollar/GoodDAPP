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
  <TouchableOpacity onPress={props.onPress} style={props.style} disabled={!props.onPress}>
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
    backgroundColor: 'white',
    borderColor: '#707070',
    borderWidth: StyleSheet.hairlineWidth
  }
})
