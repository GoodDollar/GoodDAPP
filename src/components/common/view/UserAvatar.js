// @flow
import React from 'react'
import { StyleSheet, View } from 'react-native'
import { normalize } from 'react-native-elements'
import CreateAvatar from 'exif-react-avatar-edit'
import { getScreenHeight, getScreenWidth, isPortrait } from '../../../lib/utils/Orientation'

import Section from '../layout/Section'
import Avatar from './Avatar'

export type AvatarProps = {
  profile: {
    avatar: string,
    fullName?: string,
  },
  onChange?: any => mixed,
  onClose?: any => mixed,
  originalSize?: boolean,
  editable?: boolean,
  children?: React.Node,
}

/**
 * Touchable Users Avatar based on Avatar component
 * @param {AvatarProps} props
 * @param {Object} props.profile
 * @param {string} props.profile.avatar
 * @param {string} props.profile.fullName
 * @param {any => mixed} props.onChange
 * @param {any => mixed} props.onClose
 * @param {boolean} props.originalSize
 * @param {boolean} props.editable
 * @param {React.Node} props.children
 * @returns {React.Node}
 */
const UserAvatar = (props: AvatarProps) => {
  const { profile, editable, onChange, onClose, originalSize = false, children } = props
  let cropSize = isPortrait() ? getScreenWidth() - 70 : getScreenHeight() - 70
  if (cropSize > 320) {
    cropSize = 320
  }

  return editable ? (
    <View style={styles.innerAvatar}>
      <View style={styles.cropContainer}>
        <CreateAvatar
          onCrop={onChange}
          onClose={onClose}
          mobileScaleSpeed={0.01}
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
        <Avatar size={originalSize ? cropSize : 120} {...props} source={profile.avatar}>
          {children}
        </Avatar>
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
    flexDirection: 'row',
  },
  innerAvatar: {
    flexDirection: 'column',
  },
  fullNameContainer: {
    padding: 10,
  },
  fullName: {
    textAlign: 'left',
  },
  cropContainer: {
    marginTop: normalize(5),
    flex: 1,
    justifyContent: 'center',
    flexDirection: 'row',
  },
})

export default UserAvatar
