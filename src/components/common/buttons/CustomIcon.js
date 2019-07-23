// @flow
// import Icon from 'react-native-elements/src/icons/Icon'
import React from 'react'
import normalize from 'react-native-elements/src/helpers/normalizeText'
import { View } from 'react-native'
import Icon from '../view/Icon'
import { withStyles } from '../../../lib/styles'

const CustomIcon = ({ styles, theme, name, color, size, reverse, reverseColor }) => (
  <View style={[styles.imageIcon, { backgroundColor: reverse ? color : reverseColor }]}>
    <Icon name={name} size={size} color={theme.colors.surface} />
  </View>
)

const getStylesFromProps = ({ theme }) => ({
  imageIcon: {
    borderRadius: '50%',
    padding: normalize(16),
  },
})

export default withStyles(getStylesFromProps)(CustomIcon)
