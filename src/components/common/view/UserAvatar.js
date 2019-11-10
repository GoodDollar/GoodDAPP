// @flow
import React from 'react'
import { View } from 'react-native'
import { getDesignRelativeWidth } from '../../../lib/utils/sizes'

import { withStyles } from '../../../lib/styles'

import Avatar from './Avatar'

const AVATAR_DESIGN_WIDTH = 136

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
 * @param {boolean} props.editable
 * @param {React.Node} props.children
 * @returns {React.Node}
 */
const UserAvatar = (props: AvatarProps) => {
  const { profile, children, styles, containerStyle } = props

  const avatarSize = getDesignRelativeWidth(AVATAR_DESIGN_WIDTH)

  return (
    <View style={styles.avatar}>
      <View style={[styles.innerAvatar, containerStyle]}>
        <Avatar size={avatarSize} {...props} source={profile.avatar}>
          {children}
        </Avatar>
      </View>
    </View>
  )
}

const getStylesFromProps = ({ theme }) => ({
  avatar: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  innerAvatar: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'column',
  },
  fullNameContainer: {
    marginTop: theme.sizes.default,
  },
  fullName: {
    textAlign: 'left',
  },
  cropContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: theme.paddings.mainContainerPadding,
  },
})

export default withStyles(getStylesFromProps)(UserAvatar)
