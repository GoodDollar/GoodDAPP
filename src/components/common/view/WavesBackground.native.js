import React, { Fragment, useMemo } from 'react'
import { StyleSheet, View } from 'react-native'
import WavesSVG from '../../../assets/wave50.svg'

export default ({ children }) => {
  const aspectRatio = useMemo(() => {
    // getting width and height of svg
    const [, , width, height] = WavesSVG().props.viewBox.split(' ')

    // calculate aspect ratio for svg wrapper
    return Number(width) / Number(height)
  }, [])

  return (
    <Fragment>
      <View style={styles.wavesBackground}>
        <View style={[styles.wavesWrapper, { aspectRatio }]}>
          <WavesSVG />
        </View>
      </View>
      {children}
    </Fragment>
  )
}

const styles = StyleSheet.create({
  wavesBackground: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.2,
  },
  wavesWrapper: {
    width: '100%',
    height: '100%',
  },
})
