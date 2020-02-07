import React from 'react'
import Lottie from 'lottie-react-native'
import { getScreenHeight, getScreenWidth } from '../../../../lib/utils/Orientation'
import { getAnimationData } from '../../../../lib/utils/lottie'
const { animationData, imageAssetsFolder } = getAnimationData('Error', require('./data'))

class Error extends React.Component {
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
          paddingBottom: 20
        }}
        loop={false}
      />
    )
  }
}

export default Error
