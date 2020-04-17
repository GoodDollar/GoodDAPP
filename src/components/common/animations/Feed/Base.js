import React from 'react'
import Lottie from 'lottie-react-native'
import { Platform } from 'react-native'
import AnimationBase from '../Base'

class FeedInfo extends AnimationBase {
  state = {
    isWeb: Platform.OS === 'web',
    performCount: 0,
  }

  onMount() {
    const { delay = 0 } = this.props

    this.anim.onComplete = this.onAnimationFinishHandler

    setTimeout(() => this.anim.play(), delay)
  }

  onAnimationFinishHandler = () => {
    const { onFinish, repeat } = this.props

    this.setState(prevState => {
      const newPerformCount = ++prevState.performCount

      if (newPerformCount >= repeat) {
        if (onFinish && typeof onFinish === 'function') {
          onFinish()
        }
      } else {
        if (prevState.isWeb) {
          this.anim.goToAndPlay(0, true)
        } else {
          this.anim.play()
        }
      }

      return {
        performCount: newPerformCount,
      }
    })
  }

  render() {
    const { style } = this.props
    const { isWeb } = this.state

    return (
      <Lottie
        ref={this.setAnim}
        source={this.animationData}
        style={style}
        loop={false}
        onAnimationFinish={isWeb ? undefined : this.onAnimationFinishHandler}
      />
    )
  }
}

FeedInfo.defaultProps = {
  repeat: 1,
  style: {},
  height: 34,
  width: 34,
}

export default FeedInfo
