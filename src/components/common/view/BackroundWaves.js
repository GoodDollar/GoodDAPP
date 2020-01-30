import React, { Fragment } from 'react'
import { Image, StyleSheet } from 'react-native'
import waves from '../../../assets/wave50.svg'

export default ({ children }) => {
  return (
    <Fragment>
      <Image source={waves} style={styles.backgroundWaves} resizeMode="repeat" />
      {children}
    </Fragment>
  )
}

const styles = StyleSheet.create({
  backgroundWaves: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    opacity: 0.5,
    backgroundColor: 'transparent',
  },
})
