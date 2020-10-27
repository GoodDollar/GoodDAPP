import React from 'react'
import Lottie from 'lottie-react-native'

import AnimationBase from '../Base'
import { getAnimationData } from '../../../../lib/utils/lottie'
import { getDesignRelativeHeight, getDesignRelativeWidth } from '../../../../lib/utils/sizes'

const { animationData, imageAssetsFolder } = getAnimationData('Error', require('./data'))

class Error extends AnimationBase {
  render() {
    return (
      <Lottie
        imageAssetsFolder={imageAssetsFolder}
        enableMergePathsAndroidForKitKatAndAbove={true}
        autoPlay={true}
        source={this.improveAnimationData(animationData)}
        autoSize={false}
        style={{
          top: -getDesignRelativeHeight(97, false) * 0.33,
          width: getDesignRelativeWidth(97, false),
          marginHorizontal: 'auto',
          marginVertical: 'auto',
          alignSelf: 'center',
        }}
        loop={false}
      />
    )
  }
}

export default Error
