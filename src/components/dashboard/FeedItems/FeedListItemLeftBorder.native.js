import React from 'react'
import { View } from 'react-native'
import { withStyles } from '../../../lib/styles'
import WavePatternSVG from '../../../assets/feedListItemPattern.svg'

const FeedListItemLeftBorder = ({ styles, style }) => {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.wavesBackground}>
        <WavePatternSVG />
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
  wavesBackground: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
})

export default withStyles(getStylesFromProps)(FeedListItemLeftBorder)
