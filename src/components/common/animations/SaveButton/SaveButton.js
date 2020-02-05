import React from 'react'
import Lottie from 'lottie-react-native'
import { TouchableOpacity } from 'react-native'
import { isMobileReactNative } from '../../../../lib/utils/platform'
import { withStyles } from '../../../../lib/styles'
import animationData from './data.json'

class SaveButton extends React.Component {
  componentDidMount() {
    if (!isMobileReactNative) {
      this.anim.onEnterFrame = e => {
        const { loading } = this.props
        if (e.currentTime > 39 && loading) {
          if (!isMobileReactNative) {
            this.anim.goToAndPlay(0, true)
          }
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
        this.anim.play(0, 39)
      } else {
        this.anim.play()
      }
    }
  }

  setAnim = anim => {
    this.anim = anim
  }

  handlePress = () => {
    const { onPress } = this.props

    onPress && onPress()

    if (isMobileReactNative) {
      this.anim.play(0, 39)
    } else {
      this.anim.play()
    }
  }

  handleAnimationFinish = () => {
    const { onFinish, loading } = this.props

    if (onFinish && !loading) {
      onFinish()
    } else if (loading) {
      this.play(0, 39)
    }
  }

  render() {
    const { styles, style = {}, loading, disabled } = this.props

    return (
      <TouchableOpacity style={[styles.wrapper, style]} disabled={loading || disabled} onPress={this.handlePress}>
        <Lottie ref={this.setAnim} loop={false} source={animationData} onAnimationFinish={this.handleAnimationFinish} />
      </TouchableOpacity>
    )
  }
}

const styles = ({ theme }) => {
  return {
    wrapper: {
      width: '100%',
    },
  }
}

export default withStyles(styles)(SaveButton)
