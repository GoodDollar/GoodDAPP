import React from 'react'
import { View } from 'react-native'
import { withStyles } from '../../../lib/styles'

const Separator = ({ color, width, style, theme }) => (
  <View
    style={[
      {
        borderBottomColor: theme.colors[color] || color || theme.colors.primary,
        borderBottomWidth: width,
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
