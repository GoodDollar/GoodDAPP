// @flow
import React, { useMemo } from 'react'
import { View } from 'react-native'
import Icon from '../view/Icon'
import { withStyles } from '../../../lib/styles'

const CustomIcon = ({ styles, theme, name, color, size, circle = 16, wrapper = true, reverse, reverseColor }) => {
  const [_circle, borderRadius] = useMemo(() => {
    const _circle = circle !== false

    return [_circle, _circle ? circle / 2 : null]
  }, [circle, wrapper])

  return (
    <View
      style={[
        styles.imageIcon,
        {
          backgroundColor: reverse ? color : reverseColor,
        },
        _circle && {
          width: circle,
          height: circle,
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
