import React from 'react'
import { Image, StyleSheet, View } from 'react-native'
import { withStyles } from '../../../lib/styles'
import wavePattern from '../../../assets/feedListItemPattern.svg'

const FeedListItemLeftBorder = ({ styles, style }) => {
  return (
    <View style={[styles.container, style]}>
      <Image source={wavePattern} style={StyleSheet.absoluteFill} resizeMode="cover" />
    </View>
  )
}

const getStylesFromProps = ({ color }) => ({
  container: {
    backgroundColor: color,
    position: 'relative',
    overflow: 'hidden',
  },
})

export default withStyles(getStylesFromProps)(FeedListItemLeftBorder)
