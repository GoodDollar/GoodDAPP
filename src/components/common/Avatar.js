// @flow
import React from 'react'
import { StyleSheet } from 'react-native'
import { Avatar } from 'react-native-paper'

export default (props: any) => <Avatar.Image size={34} {...props} style={[styles.avatar, props.style]} />

const styles = StyleSheet.create({
  avatar: {
    backgroundColor: 'white'
  }
})
