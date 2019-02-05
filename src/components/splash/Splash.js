import React, { Component } from 'react'
import { StyleSheet, Image, View } from 'react-native'
import splashImage from '../../assets/splash.png'

class Splash extends Component {
  render() {
    return (
      <View style={styles.screen}>
        <Image source={splashImage} style={styles.logo} resizeMode="contain" />
      </View>
    )
  }
}

const styles = StyleSheet.create({
  logo: {
    minWidth: 212,
    maxWidth: '100%',
    minHeight: 256,
    height: '80%'
  },
  screen: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%'
  }
})

export default Splash
