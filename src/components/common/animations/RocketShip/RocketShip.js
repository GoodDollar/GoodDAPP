import React from 'react'
import Lottie from 'lottie-react-native'
import { View } from 'react-native'
import animationData from './data.json'

class RocketShip extends React.Component {
  componentDidMount() {
    this.anim.onEnterFrame = e => {
      const { success } = this.props
      if (e.currentTime > 200.5 && !success) {
        this.anim.goToAndPlay(0, true)
      }
    }

    this.anim.play()
  }

  setAnim = anim => {
    this.anim = anim
  }

  onAnimationFinish = () => {
    const { onFinish } = this.props
    if (typeof onFinish === 'function') {
      onFinish()
    }
  }

  render() {
    const { height = 196, width = 196 } = this.props
    return (
      <View>
        <Lottie
          loop={false}
          onAnimationFinish={this.onAnimationFinish}
          imageAssetsFolder={'assets'}
          ref={this.setAnim}
          source={animationData}
          style={{
            // marginTop: -height / 2.4,
            width,
            height,
          }}
          enableMergePathsAndroidForKitKatAndAbove
        />
      </View>
    )
  }
}

export default RocketShip
