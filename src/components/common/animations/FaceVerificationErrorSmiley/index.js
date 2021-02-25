import React from 'react'
import { Platform } from 'react-native'
import Lottie from 'lottie-react-native'
import AnimationBase from '../Base'
import animationData from './data.json'

const styles = {
  android: {
    height: '100%',
  },
  ios: {
    height: '100%',
  },
  web: {
    height: '100%',
  },
}

class FaceVerificationSmiley extends AnimationBase {
  render() {
    return (
      <Lottie
        enableMergePathsAndroidForKitKatAndAbove
        autoPlay
        loop
        autoSize
        style={Platform.select(styles)}
        source={this.improveAnimationData(animationData)}
      />
    )
  }
}

export default FaceVerificationSmiley
