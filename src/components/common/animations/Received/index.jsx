import React from 'react'
import Lottie from 'lottie-react-native'

import AnimationBase from '../Base'
import { getAnimationData } from '../../../../lib/utils/lottie'
import { getDesignRelativeHeight } from '../../../../lib/utils/sizes'
import data from './data'

const { animationData, imageAssetsFolder } = getAnimationData('Received', data)

class Received extends AnimationBase {
  render() {
    return (
      <Lottie
        imageAssetsFolder={imageAssetsFolder}
        enableMergePathsAndroidForKitKatAndAbove={true}
        autoPlay={true}
        source={this.improveAnimationData(animationData)}
        autoSize={false}
        style={{
          height: getDesignRelativeHeight(160),
        }}
        loop={false}
      />
    )
  }
}

export default Received
