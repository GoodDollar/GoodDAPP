import React from 'react'
import { View } from 'react-native'
import Lottie from 'lottie-react-native'

import { Platform } from 'react-native'

class FeedInfo extends React.Component {
  state = {
    isWeb: Platform.OS === 'web',
    performCount: 0,
  }

  componentDidMount() {
    const { delay = 0, asImage } = this.props

    this.anim.onComplete = this.onAnimationFinishHandler

    if (asImage) {
      const lastFrame = Number(this.animationData.op) - 1

      if (this.state.isWeb) {
        this.anim.goToAndStop(lastFrame, true)
      } else {
        this.anim.play(lastFrame - 1, lastFrame)
      }
    } else {
      setTimeout(() => this.anim.play(), delay)
    }
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

  setAnim = anim => {
    this.anim = anim
  }

  render() {
    const { style } = this.props
    const { isWeb } = this.state

    return (
      <View style={style}>
        <Lottie
          ref={this.setAnim}
          source={this.animationData}
          style={{
            height: '100%',
            width: '100%',
          }}
          loop={false}
          onAnimationFinish={isWeb ? undefined : this.onAnimationFinishHandler}
        />
      </View>
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
