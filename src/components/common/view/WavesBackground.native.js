import React, { Fragment } from 'react'
import { View } from 'react-native'
import { withStyles } from '../../../lib/styles'
import WavesSVG from '../../../assets/wave50.svg'

const WavesBackground = ({ children }) => {
  return (
    <Fragment>
      <View style={styles.wavesBackground}>
        <WavesSVG />
      </View>
      {children}
    </Fragment>
  )
}

const styles = () => ({
  wavesBackground: {
    position: 'absolute',
    bottom: 0,
    left: -15,
    width: '310%',
    height: '100%',
    opacity: 0.2,
  },
})

export default withStyles(styles)(WavesBackground)
