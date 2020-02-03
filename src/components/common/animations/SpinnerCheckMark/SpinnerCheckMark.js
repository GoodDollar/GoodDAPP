import React from 'react'
import Lottie from 'lottie-react-native'
import { View } from 'react-native'
import { isMobileReactNative } from '../../../../lib/utils/platform'
import animationData from './data.json'

class SpinnerCheckMark extends React.Component {
  state = {
    speed: 1,
  }

  componentDidMount() {
    if (!isMobileReactNative) {
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
    this.anim.play()
  }

  onFinish = () => {
    const { onFinish } = this.props
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
      this.setState({
        speed: 1.5,
      })
    }
  }

  render() {
    const { height = 196, width = 196 } = this.props
    return (
      <View>
        <Lottie
          ref={this.setAnim}
          loop={false}
          onAnimationFinish={isMobileReactNative && this.onFinish}
          source={animationData}
          speed={this.state.speed}
          style={{
            marginTop: -height / (isMobileReactNative ? 6 : 3),
            width,
            height,
          }}
        />
      </View>
    )
  }
}

export default SpinnerCheckMark
