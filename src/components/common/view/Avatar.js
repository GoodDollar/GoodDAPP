// @flow
import React from 'react'
import { TouchableOpacity, View } from 'react-native'
import { Avatar } from 'react-native-paper'
import UnknownProfileSVG from '../../../assets/unknownProfile.svg'
import useOnPress from '../../../lib/hooks/useOnPress'
import { isMobileNative } from '../../../lib/utils/platform'
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
const CustomAvatar = ({ styles, style, source, onPress, size, imageSize, children, unknownStyle, ...avatarProps }) => {
  const _onPress = useOnPress(onPress)
  return (
    <TouchableOpacity
      activeOpacity={1}
      disabled={!onPress}
      onPress={_onPress}
      style={[styles.avatarContainer, { width: size, height: size, borderRadius: size / 2 }, style]}
      underlayColor="#fff"
    >
      {isMobileNative && !source ? (
        <View
          style={[{ width: size, height: size, backgroundColor: 'rgba(0, 0, 0, 0)' }, unknownStyle]}
          {...avatarProps}
        >
          <UnknownProfileSVG />
        </View>
      ) : (
        <Avatar.Image
          size={imageSize || size - 2}
          source={{ uri: source || UnknownProfileSVG }}
          style={{ backgroundColor: 'rgba(0, 0, 0, 0)' }}
          {...avatarProps}
        />
      )}
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
