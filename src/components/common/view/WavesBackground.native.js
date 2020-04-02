import React, { Fragment } from 'react'
import { StyleSheet, View } from 'react-native'
import WavesSVG from '../../../assets/wave50.svg'

export default ({ children }) => {
  return (
    <Fragment>
      <View style={styles.wavesBackground}>
        <WavesSVG />
      </View>
      {children}
    </Fragment>
  )
}

const styles = StyleSheet.create({
  wavesBackground: {
    position: 'absolute',
    bottom: 0,
    left: -15,
    width: '310%',
    height: '100%',
    opacity: 0.2,
  },
})
