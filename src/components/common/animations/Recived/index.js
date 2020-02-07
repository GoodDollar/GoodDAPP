import React from 'react'
import Lottie from 'lottie-react-native'
import { getAnimationData } from '../../../../lib/utils/lottie'
const { animationData, imageAssetsFolder } = getAnimationData('Send', require('./data'))

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
          paddingTop: 20,
          paddingBottom: 20
        }}
        loop={false}
      />
    )
  }
}

export default Recived
