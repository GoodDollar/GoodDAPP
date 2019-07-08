// @flow
import React from 'react'
import { StyleSheet, View } from 'react-native'
import { paddings } from '../../theme/styles'

const Wrapper = (props: any) => {
  const backgroundStyle = props.backgroundColor
    ? { backgroundColor: props.backgroundColor }
    : {
        backgroundImage:
          'linear-gradient(to bottom, #00AFFF, #2DC0F7, #28C0EF, #23C0E7, #1EC1DF, #19C1D7, #14C1CF, #0FC2C7, #0FC2C7, #0AC2BF, #05C2B7, #00C3AF)'
      }

  return (
    <View style={[styles.container, backgroundStyle, props.style]} {...props}>
      {props.children}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    flex: 1,
    flexDirection: 'column',
    padding: paddings.mainContainerPadding,
    width: '100%'
  }
})

export default Wrapper
