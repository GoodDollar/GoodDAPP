import React from 'react'
import Lottie from 'lottie-react-native'
import { View } from 'react-native'
import { isMobileNative } from '../../../../lib/utils/platform'
import animationData from './data.json'

class SpinnerCheckMark extends React.Component {
  state = {
    speed: 1,
    isFinish: false,
  }

  componentDidMount() {
    if (isMobileNative === false) {
      this.anim.onEnterFrame = e => {
        const { success } = this.props
        if (e.currentTime > 130.5 && !success) {
          this.anim.goToAndPlay(0, true)
        }
      }
      this.anim.onComplete = () => {
        this.onFinish()
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

  setAnim = anim => {
    this.anim = anim
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
          source={animationData}
          speed={this.state.speed}
          style={{
            marginTop: -height / (isMobileNative ? 6 : 3),
            width,
            height,
          }}
        />
      </View>
    )
  }
}

export default SpinnerCheckMark
