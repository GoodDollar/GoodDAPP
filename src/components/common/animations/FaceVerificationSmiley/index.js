import React from 'react'
import { Platform } from 'react-native'
import Lottie from 'lottie-react-native'
import { cloneDeep } from 'lodash'

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
        enableMergePathsAndroidForKitKatAndAbove={true}
        autoPlay={true}
        source={cloneDeep(animationData)}
        autoSize={true}
        style={Platform.select(styles)}
        loop={false}
      />
    )
  }
}

export default FaceVerificationSmiley
