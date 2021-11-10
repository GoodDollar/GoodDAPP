import React, { Fragment } from 'react'
import { StyleSheet, View } from 'react-native'
import WavesSVG from '../../../assets/wave50.svg'
import { getSVGAspectRatio } from '../../../lib/utils/svg'

export default ({ children }) => (
  <Fragment>
    <View style={styles.wavesBackground}>
      <View style={styles.wavesWrapper}>
        <WavesSVG />
      </View>
    </View>
    {children}
  </Fragment>
)

const styles = StyleSheet.create({
  wavesBackground: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.2,
  },
  wavesWrapper: {
    width: '100%',
    height: '100%',
    aspectRatio: getSVGAspectRatio(WavesSVG),
  },
})
