import React from 'react'
import Lottie from 'lottie-react-native'
import { Platform, TouchableOpacity } from 'react-native'
import { set } from 'lodash'
import animationData from './data.json'

class ClaimButton extends React.Component {
  state = {
    stopOnClaim: true,
  }

  constructor(props) {
    super(props)
    const { amount } = this.props

    // set amount of G$ text to animation

    set(animationData, 'layers[5].t.d.k[0].s.t', `CLAIM YOUR SHARE${amount ? ` - ${amount}` : ''} `)

    // set x coordinate of G$ text to animation
    set(animationData, 'layers[4].ks.p.k[0].s[0]', this.getGap())
    set(animationData, 'layers[4].ks.p.k[1].s[0]', this.getGap())
    set(animationData, 'layers[4].ks.p.k[2].s[0]', this.getGap())
    set(animationData, 'layers[4].ks.p.k[3].s[0]', this.getGap())
  }

  componentDidMount() {
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

  setAnim = anim => {
    this.anim = anim
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

    // calculate x coordinate of G$ text in animation
    return Platform.select({
      ios: 261 + (String(amount).length - 1) * 5,
      android: 278 + (String(amount).length - 1) * 6.5,
      web: 255 + (String(amount).length - 1) * 5,
    })
  }

  render() {
    return (
      <TouchableOpacity onPress={this.handlePress}>
        <Lottie ref={this.setAnim} loop={false} source={animationData} resizeMode="cover" style={{ width: '100%' }} />
      </TouchableOpacity>
    )
  }
}

export default ClaimButton
