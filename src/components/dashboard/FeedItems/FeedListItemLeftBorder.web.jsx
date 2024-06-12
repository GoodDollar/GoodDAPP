import React from 'react'
import { View } from 'react-native'
import { withStyles } from '../../../lib/styles'
import wavePattern from '../../../assets/feedListItemPattern.svg?url'

const FeedListItemLeftBorder = ({ styles, style }) => {
  return <View style={[styles.leftBorder, style]} />
}

const getStylesFromProps = ({ color }) => ({
  leftBorder: {
    backgroundColor: color,
    backgroundImage: `url(${wavePattern})`,
    backgroundRepeat: 'repeat-y',
    backgroundSize: 'initial',
  },
})

export default withStyles(getStylesFromProps)(FeedListItemLeftBorder)
