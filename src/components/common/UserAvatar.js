// @flow
import React from 'react'
import { StyleSheet, View } from 'react-native'
import normalize from 'react-native-elements/src/helpers/normalizeText'
import CreateAvatar from 'exif-react-avatar-edit'
import { getScreenHeight, getScreenWidth, isPortrait } from '../../lib/utils/Orientation'

import Avatar from './Avatar'
import Section from './Section'

export type AvatarProps = {
  profile: {
    avatar: string,
    fullName?: string
  },
  onChange: any => mixed,
  editable?: boolean,
  size?: number
}

/**
 * Touchable Users Avatar based on Avatar component
 * @param {AvatarProps} props
 * @param {Object} props.profile]
 * @param {string} props.profile.avatar
 * @param {string} [props.profile.fullName]
 * @param {any => mixed} props.onChange
 * @param {boolean} [props.editable]
 * @param {Number} [props.size=120]
 * @returns {React.Node}
 */
const UserAvatar = (props: AvatarProps) => {
  const { profile, editable, onChange } = props
  let cropSize = isPortrait() ? getScreenWidth() - 70 : getScreenHeight() - 70
  if (cropSize > 320) cropSize = 320

  return editable ? (
    <View style={styles.innerAvatar}>
      <View style={styles.fullNameContainer}>
        <Section.Title style={styles.fullName}>{profile.fullName}</Section.Title>
      </View>
      <View style={styles.cropContainer}>
        <CreateAvatar
          onCrop={avatar => onChange({ ...profile, avatar })}
          width={cropSize}
          height={cropSize}
          lineWidth={2}
          minCropRadius={15}
          shadingOpacity={0.8}
          src={profile.avatar ? profile.avatar : undefined}
        />
      </View>
    </View>
  ) : (
    <View style={styles.avatar}>
      <View style={styles.innerAvatar}>
        <Avatar size={120} {...props} source={profile.avatar} />
        <Section.Title>{profile.fullName}</Section.Title>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  avatar: {
    marginTop: normalize(50),
    flex: 1,
    justifyContent: 'center',
    flexDirection: 'row'
  },
  innerAvatar: {
    flexDirection: 'column'
  },
  fullNameContainer: {
    padding: 10
  },
  fullName: {
    textAlign: 'left'
  },
  cropContainer: {
    marginTop: normalize(5),
    flex: 1,
    justifyContent: 'center',
    flexDirection: 'row'
  }
})

export default UserAvatar
