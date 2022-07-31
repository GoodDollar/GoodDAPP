import React from 'react'
import Lottie from 'lottie-react-native'
import { View } from 'react-native'

import AnimationBase from '../Base'
import { getScreenHeight } from '../../../../lib/utils/orientation'
import { getAnimationData } from '../../../../lib/utils/lottie'
import { isMobileNative } from '../../../../lib/utils/platform'

const { animationData, imageAssetsFolder } = getAnimationData('RocketShip', require('./data'))

const cycleStart = 29
const cycleEnd = 195

const styles = {
  marginTop: -getScreenHeight() / 60,
  width: '100%',
}

class RocketShip extends AnimationBase {
  onMount = () => {
    const { anim } = this

    if (!isMobileNative) {
      anim.addEventListener('enterFrame', ({ currentTime }) => {
        if (currentTime < cycleEnd) {
          return
        }

        anim.goToAndPlay(cycleStart, true)
      })
    }

    anim.play()
  }

  onFinish = isCancelled => {
    if (!isMobileNative || isCancelled) {
      return
    }

    this.anim.play(cycleStart, cycleEnd)
  }

  render() {
    const { onFinish, setAnim } = this
    const source = this.improveAnimationData(animationData)

    return (
      <View>
        <Lottie
          onAnimationFinish={onFinish}
          loop={false}
          imageAssetsFolder={imageAssetsFolder}
          ref={setAnim}
          style={styles}
          source={source}
          enableMergePathsAndroidForKitKatAndAbove
        />
      </View>
    )
  }
}

export default RocketShip
