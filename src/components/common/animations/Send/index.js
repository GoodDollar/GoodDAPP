import React from 'react'
import Lottie from 'lottie-react-native'
import AnimationBase from '../Base'
import { getAnimationData } from '../../../../lib/utils/lottie'
import { getDesignRelativeHeight } from '../../../../lib/utils/sizes'
const { animationData, imageAssetsFolder } = getAnimationData('Send', require('./data'))

class Send extends AnimationBase {
  render() {
    return (
      <Lottie
        imageAssetsFolder={imageAssetsFolder}
        enableMergePathsAndroidForKitKatAndAbove={true}
        autoPlay={true}
        source={animationData}
        autoSize={false}
        style={{
          height: getDesignRelativeHeight(145),
        }}
        loop={false}
      />
    )
  }
}

export default Send
