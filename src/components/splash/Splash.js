import React, { Component } from 'react'
import { StyleSheet, Image, View, Text } from 'react-native'
import { normalize } from 'react-native-elements'
import splashImage from '../../assets/splash.png'

class Splash extends Component {
  render() {
    return (
      <View style={styles.screen}>
        <Text style={styles.splashText}>
          {`Welcome and thank you for participating in GoodDollar's \n`}
          <Text style={styles.boldText}>Early Access Alpha</Text>
        </Text>
        <Image source={splashImage} style={styles.logo} resizeMode="contain" />
      </View>
    )
  }
}

Splash.navigationOptions = {
  title: 'GoodDollar | Welcome'
}

const styles = StyleSheet.create({
  logo: {
    minWidth: 212,
    maxWidth: '100%',
    minHeight: 256
  },
  screen: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%'
  },
  splashText: {
    fontSize: normalize(22),
    marginHorizontal: '1.2em',
    textAlign: 'center',
    lineHeight: normalize(30)
  },
  boldText: {
    fontWeight: '700'
  }
})

export default Splash
