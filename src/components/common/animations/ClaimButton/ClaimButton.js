import React from 'react'
import Lottie from 'lottie-react-native'
import { TouchableOpacity } from 'react-native'
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

        if (stopOnClaim && e.currentTime >= 75) {
          this.anim.pause()
        }
      }
    }

    this.goToClaim()
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
          this.anim.play(0, 75)
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
          this.anim.play(75, 120)
        } else {
          this.anim.goToAndPlay(75, true)
        }
      }
    )
  }

  handlePress = () => {
    const { onPressClaim } = this.props
    const { stopOnClaim } = this.state

    if (onPressClaim && stopOnClaim) {
      onPressClaim()
    }

    if (stopOnClaim) {
      this.goToCounter()
    }
  }

  render() {
    const { amount } = this.props

    _set(animationData, 'layers[5].t.d.k[0].s.t', `CLAIM YOUR SHARE - ${amount} `)
    _set(animationData, 'layers[5].nm', `CLAIM YOUR SHARE - ${amount} `)

    return (
      <TouchableOpacity onPress={this.handlePress}>
        <Lottie
          ref={this.setAnim}
          loop={false}
          source={animationData}
          imageAssetsFolder={imageAssetsFolder}
          resizeMode="cover"
          style={{
            width: '100%',
          }}
        />
      </TouchableOpacity>
    )
  }
}

export default ClaimButton
