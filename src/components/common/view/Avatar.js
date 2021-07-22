// @flow
import React, { useMemo } from 'react'
import { Image, TouchableOpacity, View } from 'react-native'
import { Avatar } from 'react-native-paper'

import UnknownProfileSVG from '../../../assets/unknownProfile.svg'
import { withStyles } from '../../../lib/styles'
import useOnPress from '../../../lib/hooks/useOnPress'

import GoodDollarLogo from '../../../assets/Feed/favicon-96x96.svg'
import useImageSource from '../../../lib/hooks/useImageSource'

/**
 * Touchable Avatar
 * @param {Props} props
 * @param {Function} [props.onPress]
 * @param {String} [props.source]
 * @param {Object} [props.style]
 * @param {Number} [props.size=34]
 * @returns {React.Node}
 */
const CustomAvatar = ({
  styles,
  style,
  imageStyle,
  unknownStyle,
  size,
  imageSize,
  plain,
  source,
  onPress,
  children,
  ...avatarProps
}) => {
  const _onPress = useOnPress(onPress)
  const isGDLogo = source === -1
  const imgSource = useImageSource(source)
  const ImageComponent = plain ? Image : Avatar.Image

  const calculatedStyles = useMemo(() => {
    const container = { width: size, height: size, borderRadius: size / 2 }
    const background = { backgroundColor: 'rgba(0, 0, 0, 0)' }
    const wrapper = { ...background, width: size, height: size }

    return { container, wrapper, background }
  }, [size])

  return (
    <TouchableOpacity
      activeOpacity={1}
      disabled={!onPress}
      onPress={_onPress}
      style={[styles.avatarContainer, calculatedStyles.container, style]}
      underlayColor="#fff"
    >
      {isGDLogo ? (
        <View style={calculatedStyles.wrapper} {...avatarProps}>
          <GoodDollarLogo />
        </View>
      ) : imgSource ? (
        <ImageComponent
          size={imageSize || size - 2}
          source={imgSource}
          style={[calculatedStyles.background, imageStyle]}
          {...avatarProps}
        />
      ) : (
        <View style={[calculatedStyles.wrapper, unknownStyle]} {...avatarProps}>
          <UnknownProfileSVG />
        </View>
      )}
      {children}
    </TouchableOpacity>
  )
}

CustomAvatar.defaultProps = {
  size: 42,
  plain: false,
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
