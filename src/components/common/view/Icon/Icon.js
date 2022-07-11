// @flow
import React from 'react'
import { withTheme } from 'react-native-paper'
import createIconSetFromFontello from 'react-native-vector-icons/lib/create-icon-set-from-fontello'
import useOnPress from '../../../../lib/hooks/useOnPress'
import fontelloConfig from '../../../../assets/fonts/config.json'

const Icon = createIconSetFromFontello(fontelloConfig)

type IconProps = {
  name: string,
  color?: string,
  size?: number,
  style?: {},
  theme: Object,
}

export default withTheme(({ theme, color, size = 16, onPress, ...iconProps }: IconProps) => {
  const onIconPress = useOnPress(onPress)
  const { colors } = theme

  return <Icon size={size} onPress={onIconPress} color={colors[color] || color || colors.primary} {...iconProps} />
})
