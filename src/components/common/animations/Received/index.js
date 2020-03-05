import React from 'react'
import Lottie from 'lottie-react-native'
import { getAnimationData } from '../../../../lib/utils/lottie'
import { getDesignRelativeHeight } from '../../../../lib/utils/sizes'

const { animationData, imageAssetsFolder } = getAnimationData('Received', require('./data'))

class Received extends React.Component {
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

export default Received
