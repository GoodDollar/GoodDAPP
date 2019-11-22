// @flow
import React from 'react'
import { TouchableOpacity, View } from 'react-native'
import { Avatar } from 'react-native-paper'
import unknownProfile from '../../../assets/unknownProfile.svg'
import { withStyles } from '../../../lib/styles'
import { theme } from '../../theme/styles'
import Text from './Text'

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
  const { styles, style, onPress, size, profile, cameFromW3Site, smallLetter, ...restProps } = props
  const { avatar, fullName, letterAvatarBackground } = profile
  const firstLetter = fullName && fullName[0]
  const showLetterAvatar = !avatar && firstLetter

  return (
    <TouchableOpacity
      activeOpacity={0.5}
      disabled={!onPress}
      onPress={onPress}
      style={[styles.avatarContainer, { width: size, height: size, borderRadius: size / 2 }, style]}
      underlayColor="#fff"
    >
      {showLetterAvatar ? (
        <View style={[styles.letterAvatar, { backgroundColor: letterAvatarBackground || theme.colors.gray50Percent }]}>
          <Text style={styles.letterAvatarText} color="white" fontSize={smallLetter ? 14 : 30}>
            {firstLetter.toUpperCase()}
          </Text>
        </View>
      ) : (
        <Avatar.Image
          size={size - 2}
          source={{ uri: avatar || unknownProfile }}
          style={{ backgroundColor: 'rgba(0, 0, 0, 0)' }}
          {...restProps}
        />
      )}
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
  letterAvatar: {
    height: '100%',
    width: '100%',
    borderRadius: '50%',
  },
  letterAvatarText: {
    margin: 'auto',
  },
})

export default withStyles(getStylesFromProps)(CustomAvatar)
