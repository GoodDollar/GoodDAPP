import React from 'react'
import Lottie from 'lottie-react-native'
import { Animated, AppState, Easing, View } from 'react-native'

import AnimationBase from '../Base'
import { getScreenHeight } from '../../../../lib/utils/orientation'
import { getAnimationData } from '../../../../lib/utils/lottie'

const { animationData, imageAssetsFolder } = getAnimationData('RocketShip', require('./data'))
const { fr, op } = animationData

const styles = { marginTop: -getScreenHeight() / 60, width: '100%' }

class RocketShip extends AnimationBase {
  state = {
    progress: new Animated.Value(0),
    prevAppState: 'active',
    lastAnimValue: 0,
  }

  static getDuration(start, end) {
    return fr * end - fr * start
  }

  startAnimation(start, end) {
    this.state.progress.setValue(start)
    Animated.timing(this.state.progress, {
      toValue: end,
      duration: RocketShip.getDuration(start, end),
      easing: Easing.linear,
      useNativeDriver: false,
    }).start()
  }

  animationListenerCallback = ({ value }) => {
    if (value >= op - 2) {
      this.state.progress.stopAnimation()
      this.startAnimation(29, op)
    }
  }

  componentDidMount() {
    this.state.progress.addListener(this.animationListenerCallback)

    AppState.addEventListener('change', nextState => {
      if (this.state.prevAppState === 'active' && nextState.match(/inactive|background/)) {
        this.state.progress.stopAnimation(lastAnimValue => this.setState({ lastAnimValue }))
      }
      if (this.state.prevAppState.match(/inactive|background/) && nextState === 'active') {
        this.startAnimation(this.state.lastAnimValue, op)
      }
      this.setState({ prevAppState: nextState })
    })

    this.startAnimation(0, op)
  }

  componentWillUnmount() {
    this.state.progress.removeAllListeners()
  }

  render() {
    const progress = this.state.progress.interpolate({ inputRange: [0, op], outputRange: [0, 1] })
    return (
      <View>
        <Lottie
          loop={false}
          imageAssetsFolder={imageAssetsFolder}
          progress={progress}
          style={styles}
          source={this.improveAnimationData(animationData)}
          enableMergePathsAndroidForKitKatAndAbove
        />
      </View>
    )
  }
}

export default RocketShip
