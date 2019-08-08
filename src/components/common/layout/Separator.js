import React from 'react'
import { View } from 'react-native'
import { withStyles } from '../../../lib/styles'

const Separator = ({ color, width, style, theme }) => (
  <View
    style={[
      {
        backgroundColor: theme.colors[color] || color || theme.colors.primary,
        borderRadius: width / 2,
        height: width,
        width: '100%',
      },
      style,
    ]}
  />
)

Separator.defaultProps = {
  width: 1,
}

const getStylesFromProps = ({ theme }) => ({})

export default withStyles(getStylesFromProps)(Separator)
