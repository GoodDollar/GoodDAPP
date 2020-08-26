// @flow
import React from 'react'
import { Platform, TouchableOpacity } from 'react-native'
import { Avatar } from 'react-native-paper'
import unknownProfile from '../../../assets/unknownProfile.svg'
import { withStyles } from '../../../lib/styles'

/**
 * Touchable Avatar
 * @param {Props} props
 * @param {Function} [props.onPress]
 * @param {String} [props.source]
 * @param {Object} [props.style]
 * @param {Number} [props.size=34]
 * @returns {React.Node}
 */
const CustomAvatar = ({ styles, style, source, onPress, size, imageSize, children, ...avatarProps }) => {
  const imageSource = Platform.select({
    web: { uri: source || unknownProfile },
    default: require('../../../../public/favicon-96x96.png'),
  })
  return (
    <TouchableOpacity
      activeOpacity={1}
      disabled={!onPress}
      onPress={onPress}
      style={[styles.avatarContainer, { width: size, height: size, borderRadius: size / 2 }, style]}
      underlayColor="#fff"
    >
      <Avatar.Image
        size={imageSize || size - 2}
        source={imageSource}
        style={{ backgroundColor: 'rgba(0, 0, 0, 0)' }}
        {...avatarProps}
      />
      {children}
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
