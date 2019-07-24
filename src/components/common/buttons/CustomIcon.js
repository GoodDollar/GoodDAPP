// @flow
import Icon from 'react-native-elements/src/icons/Icon'
import React from 'react'
import { Image, View } from 'react-native'
import normalize from '../../../lib/utils/normalizeText'
import { withStyles } from '../../../lib/styles'

const customIcons = {
  qrcode: require('../../../assets/icons/qrcode.svg'),
  link: require('../../../assets/icons/link.svg'),
}

const CustomIcon = ({ styles, name, color, size, ...props }) => {
  const customIcon = customIcons[name]

  if (customIcon) {
    return (
      <View style={[styles.imageIcon, { backgroundColor: color }]}>
        <Image source={customIcon} style={{ width: size, height: size }} />
      </View>
    )
  }

  return <Icon {...props} />
}

const getStylesFromProps = ({ theme }) => {
  return {
    imageIcon: {
      borderRadius: '50%',
      padding: normalize(16),
    },
  }
}

export default withStyles(getStylesFromProps)(CustomIcon)
