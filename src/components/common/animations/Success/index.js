import React from 'react'
import Lottie from 'lottie-react-native'
import AnimationBase from '../Base'
import { getAnimationData } from '../../../../lib/utils/lottie'
const { animationData, imageAssetsFolder } = getAnimationData('Success', require('./data'))

class Success extends AnimationBase {
  render() {
    return (
      <Lottie
        imageAssetsFolder={imageAssetsFolder}
        enableMergePathsAndroidForKitKatAndAbove={true}
        autoPlay={true}
        source={animationData}
        autoSize={false}
        style={{
          paddingTop: 20,
          paddingBottom: 20,
        }}
        loop={false}
      />
    )
  }
}

export default Success
