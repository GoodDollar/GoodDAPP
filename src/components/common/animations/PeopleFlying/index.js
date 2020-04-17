import { Platform, View } from 'react-native'
import React from 'react'
import Lottie from 'lottie-react-native'
import AnimationBase from '../Base'
import animationData from './data.json'

const styles = {
  android: {
    width: '100%',
  },
  ios: {
    width: '100%',
  },
  web: {
    width: '100%',
  },
}

class PeopleFlying extends AnimationBase {
  render() {
    return (
      <View>
        <Lottie
          enableMergePathsAndroidForKitKatAndAbove={true}
          autoPlay={true}
          source={animationData}
          style={Platform.select(styles)}
          loop={false}
        />
      </View>
    )
  }
}

export default PeopleFlying
