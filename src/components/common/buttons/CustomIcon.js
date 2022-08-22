// @flow
import React, { useMemo } from 'react'
import { View } from 'react-native'
import Icon from '../view/Icon'
import { withStyles } from '../../../lib/styles'

const CustomIcon = ({ styles, theme, name, color, size, circleSize = 16, wrapper = true, reverse, reverseColor }) => {
  const borderRadius = useMemo(() => (wrapper ? circleSize / 2 : null), [circleSize, wrapper])
  return (
    <View
      style={[
        styles.imageIcon,
        {
          backgroundColor: reverse ? color : reverseColor,
        },
        wrapper && {
          width: circleSize,
          height: circleSize,
          borderRadius,
        },
      ]}
    >
      <Icon name={name} size={size} color={theme.colors.surface} />
    </View>
  )
}

const getStylesFromProps = ({ theme, size }) => ({
  imageIcon: {
    justifyContent: 'center',
    alignItems: 'center',
  },
})

export default withStyles(getStylesFromProps)(CustomIcon)
