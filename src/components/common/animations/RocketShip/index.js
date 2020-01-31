import React from 'react'
import Lottie from 'lottie-react-native'
import { Platform, View } from 'react-native'
import { getScreenHeight, getScreenWidth } from '../../../../lib/utils/Orientation'
import { getAnimationData } from '../../../../lib/utils/lottie'

const { animationData, imageAssetsFolder } = getAnimationData('RocketShip', require('./data'))

const styles = {
  android: { marginTop: -getScreenHeight() / 8, width: '100%' },
  ios: { marginTop: -getScreenHeight() / 10, width: '100%', zIndex: -1 },
  web: { marginTop: -getScreenHeight() / 4 },
}

class RocketShip extends React.Component {
  componentDidMount() {
    if (Platform.OS === 'web') {
      this.anim.onEnterFrame = e => {
        if (e.currentTime >= 110 && this.anim) {
          this.anim.goToAndPlay(30, true)
        }
      }
    }
    this.anim.play()
  }

  setAnim = anim => {
    this.anim = anim
  }

  onFinish = () => {
    if (Platform.OS !== 'web') {
      this.anim.play(30, 110)
    }
  }

  render() {
    return (
      <View style={{ height: getScreenWidth() }}>
        <Lottie
          play={50}
          onAnimationFinish={this.onFinish}
          loop={false}
          imageAssetsFolder={imageAssetsFolder}
          ref={this.setAnim}
          style={Platform.select(styles)}
          source={animationData}
          enableMergePathsAndroidForKitKatAndAbove
        />
      </View>
    )
  }
}

export default RocketShip
