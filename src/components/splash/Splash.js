import React, { Component } from 'react'
import { Image, StyleSheet, View } from 'react-native'
import normalize from 'react-native-elements/src/helpers/normalizeText'
import splashImage from '../../assets/splash.png'
import Text from '../common/view/Text'

//minimize delay <Image> has over web <img>
Image.prefetch(splashImage)
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
  title: 'GoodDollar | Welcome',
}

const styles = StyleSheet.create({
  logo: {
    maxWidth: '100%',
    minHeight: 256,
    minWidth: 212,
  },
  screen: {
    alignItems: 'center',
    backgroundColor: '#fff',
    display: 'flex',
    height: '100%',
    justifyContent: 'center',
  },
  splashText: {
    fontSize: normalize(22),
    marginHorizontal: '1.2em',
    textAlign: 'center',
    lineHeight: normalize(30),
  },
  boldText: {
    fontWeight: '700',
  },
})

export default Splash
