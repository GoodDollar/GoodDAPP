import React from 'react'
import Lottie from 'lottie-react-native'
import { Platform, View } from 'react-native'

import AnimationBase from '../Base'
import { getScreenHeight } from '../../../../lib/utils/orientation'
import { getAnimationData } from '../../../../lib/utils/lottie'

const { animationData, imageAssetsFolder } = getAnimationData('RocketShip', require('./data'))

const styles = {
  android: { marginTop: -getScreenHeight() / 60, width: '100%' },
  ios: { marginTop: -getScreenHeight() / 60, width: '100%' },
  web: { marginTop: -getScreenHeight() / 60, width: '100%' },
}

class RocketShip extends AnimationBase {
  onMount = () => {
    if (Platform.OS === 'web') {
      this.anim.onEnterFrame = e => {
        if (e.currentTime >= 195 && this.anim) {
          this.anim.goToAndPlay(29, true)
        }
      }
    }

    this.anim.play()
  }

  onFinish = () => {
    if (Platform.OS !== 'web') {
      this.anim.play(29, 195)
    }
  }

  render() {
    return (
      <View>
        <Lottie
          onAnimationFinish={this.onFinish}
          loop={false}
          imageAssetsFolder={imageAssetsFolder}
          ref={this.setAnim}
          style={Platform.select(styles)}
          source={this.improveAnimationData(animationData)}
          enableMergePathsAndroidForKitKatAndAbove
        />
      </View>
    )
  }
}

export default RocketShip
