import React from 'react'
import Lottie from 'lottie-react-native'
import { getAnimationData } from '../../../../lib/utils/lottie'
import { getDesignRelativeHeight } from '../../../../lib/utils/sizes'

const { animationData, imageAssetsFolder } = getAnimationData('Recived', require('./data'))

class Recived extends React.Component {
  render() {
    return (
      <Lottie
        imageAssetsFolder={imageAssetsFolder}
        enableMergePathsAndroidForKitKatAndAbove={true}
        autoPlay={true}
        source={animationData}
        autoSize={false}
        style={{
          width: 65,
          marginTop: getDesignRelativeHeight(-45),
          position: 'absolute',
        }}
        loop={false}
      />
    )
  }
}

export default Recived
