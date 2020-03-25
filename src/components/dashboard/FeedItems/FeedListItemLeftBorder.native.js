import React from 'react'
import { StyleSheet, View } from 'react-native'
import { withStyles } from '../../../lib/styles'
import WavePatternSVG from '../../../assets/feedListItemPattern.svg'

const FeedListItemLeftBorder = ({ styles, style }) => {
  return (
    <View style={[styles.container, style]}>
      <View style={StyleSheet.absoluteFill}>
        <WavePatternSVG width="100%" height="100%" />
      </View>
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
