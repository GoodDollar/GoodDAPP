// @flow
import React from 'react'
import { withTheme } from 'react-native-paper'
import { createIconSetFromFontello } from 'react-native-vector-icons'
import fontelloConfig from './config.json'
// import './index.css'

const Icon = createIconSetFromFontello(fontelloConfig)

type IconProps = {
  name: string,
  color?: string,
  size?: number,
  style?: {},
  theme: Object,
}

export default withTheme(({ theme, color, size, ...props }: IconProps) => (
  <Icon size={size || 16} color={theme.colors[color] || color || theme.colors.primary} {...props} />
))

// export default () => null
