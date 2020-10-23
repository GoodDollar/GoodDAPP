// @flow
import React, { useCallback } from 'react'
import { withTheme } from 'react-native-paper'
import { noop } from 'lodash'
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

export default withTheme(
  ({ theme, color, size = 16, onPress = noop, allowDefault = false, ...iconProps }: IconProps) => {
    const onIconPress = allowDefault ? useCallback(onPress) : useOnPress(onPress)
    const { colors } = theme

    return <Icon size={size} onPress={onIconPress} color={colors[color] || color || colors.primary} {...iconProps} />
  },
)
