// @flow
import React from 'react'
import { TouchableOpacity } from 'react-native'
import { Avatar } from 'react-native-paper'
import unknownProfile from '../../../assets/unknownProfile.svg'
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
const CustomAvatar = (props: AvatarProps) => {
  const { styles, style, source, onPress, size, ...restProps } = props
  const imageSource = source ? { uri: source } : unknownProfile

  return (
    <TouchableOpacity
      activeOpacity={0.5}
      disabled={!onPress}
      onPress={onPress}
      style={[styles.avatarContainer, { width: size, height: size, borderRadius: size / 2 }, style]}
      underlayColor="#fff"
    >
      <Avatar.Image
        size={size - 2}
        source={imageSource}
        style={{ backgroundColor: 'rgba(0, 0, 0, 0)' }}
        {...restProps}
      />
      {props.children}
    </TouchableOpacity>
  )
}

CustomAvatar.defaultProps = {
  size: 42,
}

const getStylesFromProps = ({ theme }) => ({
  avatarContainer: {
    backgroundColor: theme.colors.gray50Percent,
    borderWidth: 1,
    borderColor: theme.colors.gray80Percent,
  },
})

export default withStyles(getStylesFromProps)(CustomAvatar)
