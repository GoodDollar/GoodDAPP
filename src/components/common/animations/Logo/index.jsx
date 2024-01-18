import React from 'react'
import Lottie from 'lottie-react-native'
import { Platform } from 'react-native'
import { isMobileNative } from '../../../../lib/utils/platform'

import AnimationBase from '../Base'
import { getAnimationData } from '../../../../lib/utils/lottie'
import data from './data'

const { animationData, imageAssetsFolder } = getAnimationData('Logo', data)

const styles = {
  android: {
    width: '100%',
  },
  ios: {
    width: '100%',
  },
  web: {
    width: '100%',
  },
}

class Logo extends AnimationBase {
  onMount = () => {
    if (this.props.animation) {
      this.anim.play()
    } else {
      //show static frame
      if (isMobileNative) {
        this.anim.play(5199, 5200)
      } else {
        this.anim.goToAndStop(5200)
      }
    }
  }

  render() {
    return (
      <Lottie
        ref={this.setAnim}
        imageAssetsFolder={imageAssetsFolder}
        enableMergePathsAndroidForKitKatAndAbove={true}
        source={this.improveAnimationData(animationData)}
        autoSize={false}
        style={[Platform.select(styles), this.props.style]}
        loop={false}
      />
    )
  }
}

export default Logo
