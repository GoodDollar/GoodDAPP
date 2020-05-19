import React from 'react'
import Lottie from 'lottie-react-native'
import { cloneDeep } from 'lodash'

import AnimationBase from '../Base'
import { getAnimationData } from '../../../../lib/utils/lottie'

const { animationData, imageAssetsFolder } = getAnimationData('Error', require('./data'))

class Error extends AnimationBase {
  render() {
    return (
      <Lottie
        imageAssetsFolder={imageAssetsFolder}
        enableMergePathsAndroidForKitKatAndAbove={true}
        autoPlay={true}
        source={cloneDeep(animationData)}
        autoSize={false}
        style={{
          width: 200,
          marginHorizontal: 'auto',
          paddingTop: 20,
          paddingBottom: 20,
        }}
        loop={false}
      />
    )
  }
}

export default Error
