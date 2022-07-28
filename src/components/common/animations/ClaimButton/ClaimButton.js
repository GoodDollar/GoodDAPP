import React from 'react'
import Lottie from 'lottie-react-native'
import { Platform, TouchableOpacity } from 'react-native'
import { set } from 'lodash'
import { t } from '@lingui/macro'
import AnimationBase from '../Base'
import { weiToMask } from '../../../../lib/wallet/utils'
import { getAnimationData } from '../../../../lib/utils/lottie'

const { animationData } = getAnimationData('ClaimButton', require('./data'))

class ClaimButton extends AnimationBase {
  state = {
    stopOnClaim: true,
  }

  constructor(props) {
    super(props)
    const { amount, formatter } = this.props
    const numberFormatter = formatter || weiToMask
    const entitlement = amount === undefined ? '-.--' : numberFormatter(amount)
    const length = String(entitlement).length

    // set amount of G$ text to animation

    set(animationData, 'layers[5].t.d.k[0].s.t', t`CLAIM YOUR SHARE${entitlement ? ` - ${entitlement}` : ''} `)

    const gap = this.getGap(length)

    // set x coordinate of G$ text to animation
    set(animationData, 'layers[4].ks.p.k[0].s[0]', gap)
    set(animationData, 'layers[4].ks.p.k[1].s[0]', gap)
    set(animationData, 'layers[4].ks.p.k[2].s[0]', gap)
    set(animationData, 'layers[4].ks.p.k[3].s[0]', gap)
  }

  onMount = () => {
    if (Platform.OS === 'web') {
      this.anim.onEnterFrame = e => {
        const { stopOnClaim } = this.state
        if (stopOnClaim && e.currentTime >= 75) {
          this.anim.pause()
        }
      }
    }

    this.goToClaim()
  }

  goToClaim = () => {
    const cb = () => {
      if (Platform.OS === 'web') {
        this.anim.goToAndPlay(0, true)
      } else {
        this.anim.play(0, 75)
      }
    }
    this.setState({ stopOnClaim: true }, cb)
  }

  goToCounter = () => {
    const cb = () => {
      if (Platform.OS === 'web') {
        this.anim.goToAndPlay(75, true)
      } else {
        this.anim.play(75, 0)
      }
    }
    this.setState({ stopOnClaim: false }, cb)
  }

  handlePress = e => {
    const { onPressClaim } = this.props
    const { stopOnClaim } = this.state

    e.preventDefault()

    if (onPressClaim && stopOnClaim) {
      onPressClaim()
    }

    if (stopOnClaim) {
      this.goToCounter()
    }
  }

  getGap(length) {
    // calculate x coordinate of G$ text in animation
    return Platform.select({
      ios: 261 + (length - 1) * 5,
      android: 278 + (length - 1) * 6.5,
      web: 255 + (length - 1) * 5,
    })
  }

  render() {
    return (
      <TouchableOpacity onPress={this.handlePress}>
        <Lottie
          ref={this.setAnim}
          loop={false}
          source={this.improveAnimationData(animationData)}
          resizeMode="cover"
          style={{ width: '100%' }}
        />
      </TouchableOpacity>
    )
  }
}

export default ClaimButton
