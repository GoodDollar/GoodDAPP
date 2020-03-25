import React from 'react'
import Lottie from 'lottie-react-native'
import { TouchableOpacity } from 'react-native'
import { isMobileNative } from '../../../../lib/utils/platform'
import { withStyles } from '../../../../lib/styles'
import animationData from './data.json'

class ShareLinkReceiveButton extends React.Component {
  state = {
    disabled: false,
    performed: false,
  }

  componentDidMount() {
    this.anim.onComplete = this.onAnimationFinish
  }

  onAnimationFinish = () => {
    this.setState({
      performed: true,
      disabled: false,
    })
  }

  setAnim = anim => {
    this.anim = anim
  }

  handlePress = () => {
    const { onPress, onPressDone } = this.props
    const { performed } = this.state

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
          source={animationData}
          onAnimationFinish={isMobileNative && this.onAnimationFinish}
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

export default withStyles(styles)(ShareLinkReceiveButton)
