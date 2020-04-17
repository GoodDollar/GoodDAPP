import React from 'react'
import Lottie from 'lottie-react-native'
import { isMobile } from 'mobile-device-detect'
import AnimationBase from '../Base'
import { getScreenHeight, getScreenWidth } from '../../../../lib/utils/Orientation'
import animationData from './data.json'

class Logo extends AnimationBase {
  render() {
    return (
      <Lottie
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
