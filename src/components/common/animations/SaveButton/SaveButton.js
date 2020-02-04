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
        const { success } = this.props
        if (e.currentTime > 39 && !success) {
          this.anim.goToAndPlay(0, true)
        }
      }
    }
  }

  setAnim = anim => {
    this.anim = anim
  }

  handlePress = () => {
    const { onPress } = this.props

    onPress()
    this.anim.play()
  }

  render() {
    const { styles, style = {}, loading, disabled } = this.props

    return (
      <TouchableOpacity style={[styles.wrapper, style]} disabled={loading || disabled} onPress={this.handlePress}>
        <Lottie ref={this.setAnim} loop={false} source={animationData} />
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
