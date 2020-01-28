import React from 'react'
import Lottie from 'lottie-react-native'
import { Image, Platform, View } from 'react-native'
import { getScreenHeight, getScreenWidth } from '../../../../lib/utils/Orientation'
import animationDataNative from './data.json'
import animationDataWeb from './data-web.json'

const animationData = Platform.OS === 'web' ? animationDataWeb : animationDataNative

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
          imageAssetsFolder={'assets'}
          ref={this.setAnim}
          style={{ marginTop: -getScreenHeight() / 6 }}
          source={animationData}
          enableMergePathsAndroidForKitKatAndAbove
        />
      </View>
    )
  }
}

export default RocketShip
