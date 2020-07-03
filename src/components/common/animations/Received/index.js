import React from 'react'
import Lottie from 'lottie-react-native'
import { cloneDeep } from 'lodash'

import AnimationBase from '../Base'
import { getAnimationData } from '../../../../lib/utils/lottie'
import { getDesignRelativeHeight } from '../../../../lib/utils/sizes'

const { animationData, imageAssetsFolder } = getAnimationData('Received', require('./data'))

class Received extends AnimationBase {
  render() {
    return (
      <Lottie
        imageAssetsFolder={imageAssetsFolder}
        enableMergePathsAndroidForKitKatAndAbove={true}
        autoPlay={true}
        source={cloneDeep(animationData)}
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
