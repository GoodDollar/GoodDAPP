import React from 'react'
import Lottie from 'lottie-react-native'
import { Platform, TouchableOpacity } from 'react-native'
import _set from 'lodash/set'
import animationData from './data.json'

class ClaimButton extends React.Component {
  state = {
    stopOnClaim: true,
  }

  componentDidMount() {
    if (Platform === 'web') {
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
        if (Platform === 'web') {
          this.anim.goToAndPlay(0, true)
        } else {
          this.anim.play(0, 75)
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
        if (Platform === 'web') {
          this.anim.goToAndPlay(75, true)
        } else {
          this.anim.play(75, 120)
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

  getGap() {
    const { amount } = this.props
    return ' '.repeat((String(amount).length - 1) * 4)
  }

  render() {
    const { amount } = this.props

    _set(animationData, 'layers[5].t.d.k[0].s.t', `CLAIM YOUR SHARE${amount ? ` - ${amount}` : ''} `)
    _set(animationData, 'layers[4].t.d.k[0].s.t', amount ? ` - ${this.getGap()}G$` : '')
    return (
      <TouchableOpacity onPress={this.handlePress}>
        <Lottie ref={this.setAnim} loop={false} source={animationData} resizeMode="cover" style={{ width: '100%' }} />
      </TouchableOpacity>
    )
  }
}

export default ClaimButton
