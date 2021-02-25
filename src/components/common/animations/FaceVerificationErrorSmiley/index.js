import React from 'react'
import Lottie from 'lottie-react-native'
import AnimationBase from '../Base'
import animationData from './data.json'

class FaceVerificationSmiley extends AnimationBase {
  render() {
    return (
      <Lottie
        enableMergePathsAndroidForKitKatAndAbove
        autoPlay
        loop
        autoSize
        style={{ height: '100%' }}
        source={this.improveAnimationData(animationData)}
      />
    )
  }
}

export default FaceVerificationSmiley
