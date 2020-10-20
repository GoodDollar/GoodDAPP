import React from 'react'
import Lottie from 'lottie-react-native'
import AnimationBase from '../Base'
import { getAnimationData } from '../../../../lib/utils/lottie'
const { animationData, imageAssetsFolder } = getAnimationData('Success', require('./data'))

class Success extends AnimationBase {
  render() {
    const { height } = this.props

    return (
      <Lottie
        imageAssetsFolder={imageAssetsFolder}
        enableMergePathsAndroidForKitKatAndAbove={true}
        autoPlay={true}
        source={this.improveAnimationData(animationData)}
        autoSize={false}
        style={{
          paddingTop: 20,
          paddingBottom: 20,
          height,
        }}
        loop={false}
      />
    )
  }
}

export default Success
