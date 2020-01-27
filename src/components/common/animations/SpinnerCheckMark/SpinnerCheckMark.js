import React from 'react'
import Lottie from 'lottie-react-native'
import { View } from 'react-native'
import logger from '../../../../lib/logger/pino-logger'
import animationData from './data.json'

const log = logger.child({ from: 'SpinnerCheckMark' })
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

  render() {
    const { height = 196, width = 196 } = this.props
    return (
      <View>
        <Lottie
          onAnimationFinish={() => {
            log.debug('onAnimationFinish')
            const { onFinish } = this.props
            if (typeof onFinish === 'function') {
              onFinish()
            }
          }}
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

export default SpinnerCheckMark
