import React from 'react'
import { Platform } from 'react-native'
import Lottie from 'lottie-react-native'
import AnimationBase from '../Base'
import animationData from './data.json'

const styles = {
  android: {},
  ios: {},
  web: {},
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
