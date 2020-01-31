import React from 'react'
import Lottie from 'lottie-react-native'
import { View } from 'react-native'
import { getScreenHeight, getScreenWidth } from '../../../../lib/utils/Orientation'
import { getAnimationData } from '../../../../lib/utils/lottie'
import { isMobileReactNative } from '../../../../lib/utils/platform'
const { animationData, imageAssetsFolder } = getAnimationData('RocketShip', require('./data'))

if (!isMobileReactNative) {
  animationData.layers[19].sc = '#ffffff00'
}

class RocketShip extends React.Component {
  componentDidMount() {
    this.anim.onEnterFrame = e => {
      if (e.currentTime >= 120) {
        this.anim.goToAndPlay(30, true)
      }
    }
    this.anim.play()
  }

  setAnim = anim => {
    this.anim = anim
  }

  render() {
    return (
      <View style={{ height: getScreenWidth() }}>
        <Lottie
          loop={false}
          imageAssetsFolder={imageAssetsFolder}
          ref={this.setAnim}
          style={{ marginTop: -getScreenHeight() / 4 }}
          source={animationData}
          enableMergePathsAndroidForKitKatAndAbove
        />
      </View>
    )
  }
}

export default RocketShip
