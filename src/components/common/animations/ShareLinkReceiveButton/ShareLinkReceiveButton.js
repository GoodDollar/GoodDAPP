import React from 'react'
import Lottie from 'lottie-react-native'
import { TouchableOpacity } from 'react-native'
import { isString } from 'lodash'
import AnimationBase from '../Base'
import { isMobileReactNative } from '../../../../lib/utils/platform'
import { withStyles } from '../../../../lib/styles'
import useNativeSharing from '../../../../lib/hooks/useNativeSharing'
import { isSharingAvailable } from '../../../../lib/share'
import { useClipboardCopy } from '../../../../lib/hooks/useClipboard'

import animationData from './data.json'

class ShareLinkReceiveButton extends AnimationBase {
  state = {
    disabled: false,
    performed: false,
  }

  onMount() {
    this.anim.onComplete = this.onAnimationFinish
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
      this.anim.play()
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
          source={this.improveAnimationData(animationData)}
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

const ShareLinkReceiveButtonStyled = withStyles(styles)(ShareLinkReceiveButton)

export const ShareButtonAnimated = ({ shareObject, ...props }) => {
  const shareOrCopy =
    isSharingAvailable || isString(shareObject) ? shareObject : [shareObject.message, shareObject.url].join('\n')
  const shareHandler = useNativeSharing(shareOrCopy)
  const copyHandler = useClipboardCopy(shareOrCopy)

  return <ShareLinkReceiveButtonStyled onPress={isSharingAvailable ? shareHandler : copyHandler} {...props} />
}

export default ShareLinkReceiveButtonStyled
