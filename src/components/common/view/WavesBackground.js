import React, { Fragment } from 'react'
import { Image, Platform, StyleSheet } from 'react-native'
import waves from '../../../assets/wave50.svg'

if (Platform.OS === 'web') {
  Image.prefetch(waves)
}

export default ({ children }) => {
  return (
    <Fragment>
      <Image source={waves} style={styles.wavesBackground} resizeMode="cover" />
      {children}
    </Fragment>
  )
}

const styles = StyleSheet.create({
  wavesBackground: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    opacity: 0.2,
    backgroundColor: 'transparent',
  },
})
