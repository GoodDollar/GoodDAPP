import React, { Fragment } from 'react'
import { StyleSheet, View } from 'react-native'
import { url as waves } from '../../../assets/wave50.svg'

export default ({ children }) => {
  return (
    <Fragment>
      <View style={styles.wavesBackground} />
      {children}
    </Fragment>
  )
}

const styles = StyleSheet.create({
  wavesBackground: {
    backgroundImage: `url(${waves})`,
    position: 'absolute',
    width: '100%',
    height: '100%',
    opacity: 0.2,
  },
})
