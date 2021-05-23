// @flow
import React, { useMemo } from 'react'
import { TouchableOpacity, View } from 'react-native'
import { Avatar } from 'react-native-paper'

import UnknownProfileSVG from '../../../assets/unknownProfile.svg'
import { withStyles } from '../../../lib/styles'
import useOnPress from '../../../lib/hooks/useOnPress'
import { isGoodDollarImage, isValidImage } from '../../../lib/utils/image'

import GoodDollarLogo from '../../../assets/Feed/favicon-96x96.svg'

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

  const [_isGDLogo, _source] = useMemo(() => {
    if (isGoodDollarImage(source)) {
      return [true, null]
    }

    return [false, isValidImage(source)]
  }, [source])

  const [bgStyle, imageStyle] = useMemo(() => {
    const background = { backgroundColor: 'rgba(0, 0, 0, 0)' }

    return [background, { ...background, width: size, height: size }]
  }, [size])

  return (
    <TouchableOpacity
      activeOpacity={1}
      disabled={!onPress}
      onPress={_onPress}
      style={[styles.avatarContainer, { width: size, height: size, borderRadius: size / 2 }, style]}
      underlayColor="#fff"
    >
      {_isGDLogo ? (
        <View style={imageStyle} {...avatarProps}>
          <GoodDollarLogo />
        </View>
      ) : _source ? (
        <Avatar.Image size={imageSize || size - 2} source={_source} style={bgStyle} {...avatarProps} />
      ) : (
        <View style={[imageStyle, unknownStyle]} {...avatarProps}>
          <UnknownProfileSVG />
        </View>
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
    alignItems: 'center',
    justifyContent: 'center',
  },
})

export default withStyles(getStylesFromProps)(CustomAvatar)
