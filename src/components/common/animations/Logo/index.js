import React from 'react'
import Lottie from 'lottie-react-native'
import { Platform } from 'react-native'
import AnimationBase from '../Base'
import { getAnimationData } from '../../../../lib/utils/lottie'
const { animationData, imageAssetsFolder } = getAnimationData('Logo', require('./data'))

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
  onMount() {
    if (this.props.animation) {
      this.anim.play()
    } else {
      this.anim.goToAndStop(5200)
    }
  }

  render() {
    return (
      <Lottie
        ref={this.setAnim}
        imageAssetsFolder={imageAssetsFolder}
        enableMergePathsAndroidForKitKatAndAbove={true}
        source={animationData}
        autoSize={false}
        style={Platform.select(styles)}
        loop={false}
      />
    )
  }
}

export default Logo
