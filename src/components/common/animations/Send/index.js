import React from 'react'
import Lottie from 'lottie-react-native'
import { getAnimationData } from '../../../../lib/utils/lottie'
import { getDesignRelativeHeight } from '../../../../lib/utils/sizes'
const { animationData, imageAssetsFolder } = getAnimationData('Send', require('./data'))

class Send extends React.Component {
  render() {
    return (
      <Lottie
        imageAssetsFolder={imageAssetsFolder}
        enableMergePathsAndroidForKitKatAndAbove={true}
        autoPlay={true}
        source={animationData}
        autoSize={false}
        style={{
          width: 100,
          marginTop: getDesignRelativeHeight(35),
          position: 'absolute',
        }}
        loop={false}
      />
    )
  }
}

export default Send
