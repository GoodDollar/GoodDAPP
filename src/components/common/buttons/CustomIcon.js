// @flow
import React, { useMemo } from 'react'
import { View } from 'react-native'
import Icon from '../view/Icon'
import { withStyles } from '../../../lib/styles'

const CustomIcon = ({ styles, theme, name, color, size, borderRadius = 8, wrapper = true, reverse, reverseColor }) => {
  const wrapperSize = useMemo(() => (wrapper ? borderRadius * 2 : null), [wrapper, borderRadius])

  return (
    <View
      style={[
        styles.imageIcon,
        {
          borderRadius,
          backgroundColor: reverse ? color : reverseColor,
        },
        wrapper && {
          width: wrapperSize,
          height: wrapperSize,
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
