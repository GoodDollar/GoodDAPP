import React from 'react'
import Lottie from 'lottie-react-native'
import { TouchableOpacity } from 'react-native'

import AnimationBase from '../Base'
import { isMobileReactNative } from '../../../../lib/utils/platform'
import { withStyles } from '../../../../lib/styles'

import animationData from './data.json'

class SaveButton extends AnimationBase {
  state = {}

  onMount = () => {
    if (!isMobileReactNative) {
      this.anim.onEnterFrame = e => {
        const { loading } = this.props
        if (e.currentTime >= 101 && loading) {
          this.anim.goToAndPlay(39, true)
        }
      }

      this.anim.onComplete = () => {
        const { loading, onFinish } = this.props
        if (onFinish && !loading) {
          onFinish()
        }
      }
    }
    if (this.props.loading) {
      if (isMobileReactNative) {
        this.anim.play(39, 101)
      } else {
        this.anim.goToAndStop(39, true)
      }
    } else {
      if (isMobileReactNative) {
        this.anim.play(12, 13)
      } else {
        this.anim.goToAndStop(12, true)
      }
    }
  }

  handlePress = event => {
    const { anim, props } = this
    const { onPress } = props

    if (onPress) {
      onPress(event)
    }

    if (!isMobileReactNative) {
      anim.goToAndPlay(12, true)
      return
    }

    this.setState({ animStep: 1 })
    anim.play(12, 101)
  }

  handleAnimationFinish = () => {
    const { onFinish, loading } = this.props
    const { animStep } = this.state
    if (isMobileReactNative) {
      if (onFinish && !loading && animStep === 1) {
        this.anim.play(101, 300)
        this.setState({ animStep: 2 })
      }
      if (onFinish && !loading && animStep === 2) {
        onFinish()
      }
      if (animStep === 1 && loading) {
        this.anim.play(39, 101)
      }
    }
  }

  render() {
    const { style = {}, loading, disabled } = this.props

    return (
      <TouchableOpacity style={style} disabled={loading || disabled} onPress={this.handlePress}>
        <Lottie
          ref={this.setAnim}
          loop={false}
          source={this.improveAnimationData(animationData)}
          onAnimationFinish={this.handleAnimationFinish}
          style={{
            width: '100%',
          }}
        />
      </TouchableOpacity>
    )
  }
}

const styles = ({ theme }) => {
  return {}
}

export default withStyles(styles)(SaveButton)
