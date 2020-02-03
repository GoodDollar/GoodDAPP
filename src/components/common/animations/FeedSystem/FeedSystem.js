import React from 'react'
import Lottie from 'lottie-react-native'
import { View } from 'react-native'
import animationData from './data.json'

class FeedSystem extends React.Component {
  componentDidMount() {
    const { showAnim, onFinish } = this.props

    if (showAnim) {
      this.anim.play()
    } else {
      this.anim.goToAndStop(this.anim.totalFrames - 1, true)
    }

    this.anim.onComplete = () => {
      if (onFinish && typeof onFinish === 'function') {
        onFinish()
      }
    }
  }

  setAnim = anim => {
    this.anim = anim
  }

  render() {
    const { height = 34, width = 34, style = {} } = this.props

    return (
      <View style={style}>
        <Lottie
          ref={this.setAnim}
          source={animationData}
          style={{
            width,
            height,
          }}
          loop={false}
        />
      </View>
    )
  }
}

export default FeedSystem
