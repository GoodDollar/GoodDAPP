// @flow
import React from 'react'
import { TouchableOpacity } from 'react-native'
import { Avatar } from 'react-native-paper'
import UnknownProfileSVG from '../../../assets/unknownProfile.svg'
import { withStyles } from '../../../lib/styles'

export type AvatarProps = {
  onPress?: () => {},
  size?: number,
  source?: string,
  style?: {},
  styles?: any,
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
const CustomAvatar = ({ children, styles, style, source, onPress, size = 42, ...avatarProps }: AvatarProps) => (
  <TouchableOpacity
    activeOpacity={0.5}
    disabled={!onPress}
    onPress={onPress}
    style={[styles.avatarContainer, { width: size, height: size, borderRadius: size / 2 }, style]}
    underlayColor="#fff"
  >
    {source ? (
      <Avatar.Image
        size={size - 2}
        source={{ uri: source }}
        style={{ backgroundColor: 'rgba(0, 0, 0, 0)' }}
        {...avatarProps}
      />
    ) : (
      <UnknownProfileSVG />
    )}
    {children}
  </TouchableOpacity>
)

const getStylesFromProps = ({ theme }) => ({
  avatarContainer: {
    backgroundColor: theme.colors.gray50Percent,
    borderWidth: 1,
    borderColor: theme.colors.gray80Percent,
  },
})

export default withStyles(getStylesFromProps)(CustomAvatar)
