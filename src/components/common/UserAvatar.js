import React from 'react'
import { StyleSheet, View } from 'react-native'
import Avatar from './Avatar'
import Section from './Section'

const UserAvatar = props => {
  const { profile } = props
  return (
    <View style={styles.avatar}>
      <View style={styles.innerAvatar}>
        <Avatar size={120} />
        <Section.Title>{profile.fullName}</Section.Title>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  avatar: {
    flex: 1,
    justifyContent: 'center',
    flexDirection: 'row'
  },
  innerAvatar: {
    flexDirection: 'column'
  }
})

export default UserAvatar
