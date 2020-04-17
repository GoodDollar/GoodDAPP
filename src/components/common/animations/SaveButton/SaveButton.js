import React from 'react'
import Lottie from 'lottie-react-native'
import { TouchableOpacity } from 'react-native'
import AnimationBase from '../Base'
import { isMobileReactNative } from '../../../../lib/utils/platform'
import { withStyles } from '../../../../lib/styles'
import animationData from './data.json'

class SaveButton extends AnimationBase {
  onMount() {
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

  handlePress = () => {
    const { onPress } = this.props
    onPress && onPress()
    if (isMobileReactNative) {
      this.setState({ animStep: 1 })
      this.anim.play(12, 101)
    } else {
      this.anim.goToAndPlay(12, true)
    }
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
    const { styles, style = {}, loading, disabled } = this.props

    return (
      <TouchableOpacity style={[styles.wrapper, style]} disabled={loading || disabled} onPress={this.handlePress}>
        <Lottie
          ref={this.setAnim}
          loop={false}
          source={animationData}
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
  return {
    wrapper: {},
  }
}

export default withStyles(styles)(SaveButton)
