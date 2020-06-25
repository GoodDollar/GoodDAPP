import React from 'react'
import Lottie from 'lottie-react-native'
import { View } from 'react-native'
import { cloneDeep } from 'lodash'
import AnimationBase from '../Base'
import { isMobileNative } from '../../../../lib/utils/platform'
import animationData from './data.json'

class SpinnerCheckMark extends AnimationBase {
  state = {
    speed: 1,
    isFinish: false,
  }

  onMount = () => {
    if (isMobileNative === false) {
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
    }

    if (isMobileNative) {
      this.anim.play(0, 130)
    } else {
      this.anim.play()
    }
  }

  onFinish = () => {
    const { onFinish, success } = this.props

    if (isMobileNative) {
      if (!success) {
        return this.anim.play(0, 129)
      } else if (!this.state.isFinish) {
        this.setState({ isFinish: true })
        return this.anim.play(130, 230)
      }
    }

    if (typeof onFinish === 'function') {
      onFinish()
    }
  }

  componentDidUpdate(prevProps) {
    if (prevProps.success === false && this.props.success === true) {
      //speed up when finished
      if (isMobileNative) {
        this.setState({
          speed: 1.5,
        })
      } else {
        this.anim.setSpeed(1.5)
      }
    }
  }

  render() {
    const { height = 196, width = 196 } = this.props
    return (
      <View>
        <Lottie
          ref={this.setAnim}
          loop={false}
          onAnimationFinish={isMobileNative && this.onFinish}
          source={cloneDeep(animationData)}
          speed={this.state.speed}
          style={{
            marginTop: -height / (isMobileNative ? 6 : 2.4),
            width,
            height,
          }}
        />
      </View>
    )
  }
}

export default SpinnerCheckMark
