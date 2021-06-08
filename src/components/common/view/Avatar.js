// @flow
import React, { useMemo } from 'react'
import { TouchableOpacity, View } from 'react-native'
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
const CustomAvatar = ({ styles, style, source, onPress, size, imageSize, children, unknownStyle, ...avatarProps }) => {
  const _onPress = useOnPress(onPress)
  const [isGDLogo, imgSource] = useImageSource(source)

  const [bgStyle, wrapperStyle] = useMemo(() => {
    const background = { backgroundColor: 'rgba(0, 0, 0, 0)' }

    return [background, { ...background, width: size, height: size }]
  }, [size])

  return (
    <TouchableOpacity
      activeOpacity={1}
      disabled={!onPress}
      onPress={_onPress}
      style={[styles.avatarContainer, { width: size, height: size, borderRadius: '50%' }, style]}
      underlayColor="#fff"
    >
      {isGDLogo ? (
        <View style={wrapperStyle} {...avatarProps}>
          <GoodDollarLogo />
        </View>
      ) : imgSource ? (
        <Avatar.Image
          size={imageSize || size - 2}
          source={imgSource}
          style={[bgStyle, { borderRadius: '50%' }]}
          {...avatarProps}
        />
      ) : (
        <View style={[wrapperStyle, unknownStyle]} {...avatarProps}>
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
