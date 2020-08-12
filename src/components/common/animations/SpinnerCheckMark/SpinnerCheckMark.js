import React from 'react'
import Lottie from 'lottie-react-native'

import AnimationBase from '../Base'

import animationData from './data.json'

class SpinnerCheckMark extends AnimationBase {
  onMount = () => {
    this.anim.onEnterFrame = e => {
      const { success } = this.props
      if (e.currentTime > 130.5 && !success) {
        this.anim.goToAndPlay(0, true)
      }
    }

    this.anim.onComplete = () => {
      const { onFinish } = this.props
      if (typeof onFinish === 'function') {
        onFinish()
      }
    }

    this.anim.play()
  }

  componentDidUpdate(prevProps, newProps) {
    if (prevProps.success === false && this.props.success === true) {
      //speed up when finished
      this.anim.setSpeed(this.props.successSpeed || 1.5)
    }
  }

  render() {
    const { height = 196, width = 196, marginTop } = this.props
    return (
      <Lottie
        ref={this.setAnim}
        source={this.improveAnimationData(animationData)}
        style={{
          marginTop: marginTop !== undefined ? marginTop : -height / 2.4,
          width,
          height,
        }}
      />
    )
  }
}

export default SpinnerCheckMark
