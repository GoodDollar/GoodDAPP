import React from 'react'
import { Platform } from 'react-native'
import Lottie from 'lottie-react-native'

import AnimationBase from '../Base'

import animationData from './data.json'

const styles = {
  android: {},
  ios: {},
  web: {
    height: '100%',
  },
}

class FaceVerificationSmiley extends AnimationBase {
  render() {
    return (
      <Lottie
        enableMergePathsAndroidForKitKatAndAbove={true}
        autoPlay={true}
        source={this.improveAnimationData(animationData)}
        autoSize={true}
        style={Platform.select(styles)}
        loop={false}
      />
    )
  }
}

export default FaceVerificationSmiley
