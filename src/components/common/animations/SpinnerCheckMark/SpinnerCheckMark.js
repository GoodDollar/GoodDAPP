import React from 'react'
import Lottie from 'lottie-react-native'
import { View } from 'react-native'
import { isInstalledApp } from '../../../../lib/utils/platform'
import animationData from './data.json'
import animationDataWeb from './data-web.json'

class SpinnerCheckMark extends React.Component {
  componentDidMount() {
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

  setAnim = anim => {
    this.anim = anim
  }

  onFinish = () => {
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
          onAnimationFinish={this.onFinish}
          imageAssetsFolder={'assets'}
          ref={this.setAnim}
          source={isInstalledApp ? animationData : animationDataWeb}
          style={{
            marginTop: -height / (isInstalledApp ? 5 : 3),
            width,
            height,
          }}
          loop={false}
          enableMergePathsAndroidForKitKatAndAbove
        />
      </View>
    )
  }
}

export default SpinnerCheckMark
