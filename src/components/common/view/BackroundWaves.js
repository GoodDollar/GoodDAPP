import React, { Fragment } from 'react'
import { StyleSheet, Image } from 'react-native'

export default ({ children }) => {
  return (
    <Fragment>
      <Image
        source={require('../../../assets/wave50.svg')}
        style={styles.backgroundWaves}
        resizeMode="repeat"
      />
      {children}
    </Fragment>
  )
}

const styles = StyleSheet.create({
  backgroundWaves: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    opacity: 0.2,
    backgroundColor: 'transparent'
  },
})
