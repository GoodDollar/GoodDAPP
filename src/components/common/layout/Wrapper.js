// @flow
import React from 'react'
import { StyleSheet, View } from 'react-native'

const Wrapper = (props: any) => {
  const backgroundStyle = props.backgroundColor
    ? { backgroundColor: props.backgroundColor }
    : {
        backgroundImage:
          'linear-gradient(to bottom, #00AFFF, #2DC0F7, #28C0EF, #23C0E7, #1EC1DF, #19C1D7, #14C1CF, #0FC2C7, #0FC2C7, #0AC2BF, #05C2B7, #00C3AF)'
      }

  return (
    <View style={[styles.container, backgroundStyle]}>
      <View style={styles.contentContainer}>
        <View style={[styles.wrapper, props.style]} {...props}>
          {props.children}
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    display: 'flex'
  },
  contentContainer: {
    justifyContent: 'center',
    flexDirection: 'row',
    flex: 1,
    alignItems: 'stretch',
    display: 'flex'
  },
  wrapper: {
    display: 'flex',
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'stretch',
    flexDirection: 'column',
    width: '100%',
    padding: 10
  }
})

export default Wrapper
