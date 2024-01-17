import React from 'react'
import { View } from 'react-native'
import { withStyles } from '../../../lib/styles'
import WavePatternSVG from '../../../assets/feedListItemPattern.svg'

const FeedListItemLeftBorder = ({ styles, style, isBig }) => {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.wavesBackground}>
        <WavePatternSVG />
        {isBig && (
          <>
            <WavePatternSVG />
            <WavePatternSVG />
          </>
        )}
      </View>
    </View>
  )
}

const getStylesFromProps = ({ color, isBig }) => ({
  container: {
    backgroundColor: color,
    position: 'relative',
    overflow: 'hidden',
  },
  wavesBackground: {
    position: 'absolute',
    width: '100%',
    height: isBig ? '35%' : '100%',
  },
})

export default withStyles(getStylesFromProps)(FeedListItemLeftBorder)
