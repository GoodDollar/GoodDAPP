import React from 'react'
import Lottie from 'lottie-react-native'
import { isMobile } from 'mobile-device-detect'
import { getScreenHeight, getScreenWidth } from '../../../../lib/utils/Orientation'
import { getAnimationData } from '../../../../lib/utils/lottie'
const { animationData, imageAssetsFolder } = getAnimationData('Logo', require('./data'))

class Logo extends React.Component {
  render() {
    return (
      <Lottie
        imageAssetsFolder={imageAssetsFolder}
        enableMergePathsAndroidForKitKatAndAbove={true}
        autoPlay={true}
        source={animationData}
        autoSize={false}
        style={
          isMobile && {
            height: getScreenHeight() - 50,
            width: getScreenWidth(),
          }
        }
        loop={false}
      />
    )
  }
}

export default Logo
