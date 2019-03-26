import React from 'react'
import { StyleSheet, View } from 'react-native'
import CreateAvatar from 'exif-react-avatar-edit'

import Avatar from './Avatar'
import Section from './Section'

const UserAvatar = props => {
  const { profile, editable, onChange } = props
  return (
    <View style={styles.avatar}>
      <View style={styles.innerAvatar}>
        {!editable ? (
          <Avatar size={120} {...props} source={profile.avatar} />
        ) : (
          <CreateAvatar
            onCrop={avatar => onChange({ ...profile, avatar })}
            width={360}
            height={360}
            lineWidth={2}
            minCropRadius={15}
            shadingOpacity={0.8}
            src={profile.avatar ? profile.avatar : undefined}
          />
        )}
        <Section.Title>{profile.fullName}</Section.Title>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  avatar: {
    top: 50,
    flex: 1,
    justifyContent: 'center',
    flexDirection: 'row'
  },
  innerAvatar: {
    flexDirection: 'column'
  }
})

export default UserAvatar
