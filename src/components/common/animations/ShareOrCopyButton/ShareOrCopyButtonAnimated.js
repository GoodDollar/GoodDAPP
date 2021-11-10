import React from 'react'
import { isString } from 'lodash'
import Lottie from 'lottie-react-native'
import { Platform, TouchableOpacity } from 'react-native'
import useNativeSharing from '../../../../lib/hooks/useNativeSharing'
import { isSharingAvailable } from '../../../../lib/share'
import { useClipboardCopy } from '../../../../lib/hooks/useClipboard'

import AnimationBase from '../Base'
import { isMobileReactNative } from '../../../../lib/utils/platform'
import { withStyles } from '../../../../lib/styles'

import animationDataCopy from './data_copy.json'
import animationDataShare from './data_share.json'

class ShareButton extends AnimationBase {
  state = {
    disabled: false,
    performed: false,
  }

  playUntil = 90 //shorten dead animation

  onMount() {
    let isDone = false
    this.anim.onComplete = this.onAnimationFinish

    if (Platform.OS !== 'web') {
      return
    }

    this.anim.onEnterFrame = e => {
      if (isDone === false && e.currentTime >= this.playUntil && this.anim) {
        isDone = true
        this.anim.goToAndPlay(150, true)
      }
    }
  }

  onAnimationFinish = () => {
    this.setState({
      performed: true,
      disabled: false,
    })
  }

  handlePress = e => {
    const { onPress, onPressDone } = this.props
    const { performed } = this.state

    e.preventDefault()

    if (performed) {
      onPressDone()
    } else {
      this.setState({
        disabled: true,
      })

      this.anim.play(0, this.playUntil)
      onPress()
    }
  }

  render() {
    const { styles, style = {} } = this.props
    const { disabled } = this.state

    return (
      <TouchableOpacity style={[styles.wrapper, style]} disabled={disabled} onPress={this.handlePress}>
        <Lottie
          ref={this.setAnim}
          loop={false}
          source={this.improveAnimationData(this.props.type === 'share' ? animationDataShare : animationDataCopy)}
          onAnimationFinish={isMobileReactNative && this.onAnimationFinish}
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
    wrapper: {
      width: '100%',
    },
  }
}

export const ShareButtonStyled = withStyles(styles)(ShareButton)

export const ShareButtonAnimated = ({ type, shareObject, onShareOrCopy, ...props }) => {
  type = type || isSharingAvailable ? 'share' : 'copy'
  const shareOrCopy =
    isSharingAvailable || isString(shareObject) ? shareObject : [shareObject.message, shareObject.url].join('\n')
  const shareHandler = useNativeSharing(shareOrCopy, { onSharePress: onShareOrCopy })
  const copyHandler = useClipboardCopy(shareOrCopy, onShareOrCopy, 1000) // give animation chance to play

  return <ShareButtonStyled type={type} onPress={isSharingAvailable ? shareHandler : copyHandler} {...props} />
}

export default ShareButtonAnimated
