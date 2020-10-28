// @flow
import React, { useMemo } from 'react'
import { withTheme } from 'react-native-paper'
import createIconSetFromFontello from 'react-native-vector-icons/lib/create-icon-set-from-fontello'
import useOnPress from '../../../../lib/hooks/useOnPress'
import fontelloConfig from './config.json'

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

  const iconColor = useMemo(() => {
    const { colors } = theme

    return colors[color] || color || colors.primary
  }, [theme, color])

  if (!onPress) {
    return <Icon size={size} color={iconColor} {...iconProps} />
  }

  return <Icon onPress={onIconPress} size={size} color={iconColor} {...iconProps} />
})
