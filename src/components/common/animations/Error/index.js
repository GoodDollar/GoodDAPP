import React from 'react'
import Lottie from 'lottie-react-native'
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
          flex: 1,
          width: 200,
          paddingVertical: 20,
          marginHorizontal: 'auto',
        }}
        loop={false}
      />
    )
  }
}

export default Error
