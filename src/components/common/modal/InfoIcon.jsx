import React from 'react'
import { View } from 'react-native'
import Icon from '../../common/view/Icon'

import { withStyles } from '../../../lib/styles'

const mapImageStylesToProps = ({ theme }) => ({
  imageWrapper: {
    display: 'flex',
    alignItems: 'center',
    transform: [{ rotate: '180deg' }],
  },
  image: {
    color: theme.colors.primary,
  },
})

export const InfoIcon = withStyles(mapImageStylesToProps)(({ styles, ...imageProps }) => (
  <View style={styles.imageWrapper}>
    <Icon name="system-filled" size={100} style={styles.image} />
  </View>
))
