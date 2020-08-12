import React from 'react'
import Lottie from 'lottie-react-native'
import logger from '../../../../lib/logger/pino-logger'
import AnimationBase from '../Base'

import animationData from './data.json'

const log = logger.child({ from: 'SpinnerCheckMark' })

class SpinnerCheckMark extends AnimationBase {
  onMount = () => {
    log.debug('checkmark onmount')
    this.anim.onEnterFrame = e => {
      const { success } = this.props
      if (e.currentTime > 130.5 && !success) {
        this.anim.goToAndPlay(0, true)
      }
    }

    this.anim.onComplete = () => {
      log.debug('checkmark oncomplete')
      const { onFinish } = this.props
      if (typeof onFinish === 'function') {
        onFinish()
      }
    }

    this.anim.play()
  }

  onStart = () => {
    const { onStart } = this.props
    if (typeof onStart === 'function') {
      onStart()
    }
  }

  componentDidUpdate(prevProps) {
    log.debug('checkmark didupdate', { prevProps, props: this.props })

    if (prevProps.success === false && this.props.success === true) {
      //speed up when finished
      this.anim.goToAndPlay(130, true)
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
