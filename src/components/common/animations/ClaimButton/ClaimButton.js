import React from 'react'
import Lottie from 'lottie-react-native'
import { View } from 'react-native'
import _set from 'lodash/set'
import { isMobileReactNative } from '../../../../lib/utils/platform'

import { getAnimationData } from '../../../../lib/utils/lottie'

const { animationData, imageAssetsFolder } = getAnimationData('ClaimButton', require('./data'))

class ClaimButton extends React.Component {
  state = {
    stopOnClaim: true,
  }

  componentDidMount() {
    if (!isMobileReactNative) {
      this.anim.onEnterFrame = e => {
        const { stopOnClaim } = this.state

        if (stopOnClaim && e.currentTime >= 50) {
          this.anim.pause()
        }
      }
    }
  }

  setAnim = anim => {
    this.anim = anim
  }

  goToClaim = () => {
    this.setState(
      {
        stopOnClaim: true,
      },
      () => {
        if (isMobileReactNative) {
          this.anim.play(0, 50)
        } else {
          this.anim.goToAndPlay(0, true)
        }
      }
    )
  }

  goToCounter = () => {
    this.setState(
      {
        stopOnClaim: false,
      },
      () => {
        if (isMobileReactNative) {
          this.anim.play(50, 120)
        } else {
          this.anim.goToAndPlay(50, true)
        }
      }
    )
  }

  render() {
    return (
      <View>
        <Lottie ref={this.setAnim} loop={false} source={animationData} imageAssetsFolder={imageAssetsFolder} />
      </View>
    )
  }
}

export default ClaimButton
