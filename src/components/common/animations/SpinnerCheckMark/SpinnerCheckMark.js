import React from 'react'
import Lottie from 'lottie-react-native'
import animationData from './data.json'

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

  componentDidUpdate(prevProps) {
    if (prevProps.success === false && this.props.success === true) {
      //speed up when finished
      this.anim.setSpeed(1.5)
    }
  }

  render() {
    const { height = 196, width = 196 } = this.props
    return (
      <Lottie
        ref={this.setAnim}
        source={animationData}
        style={{
          marginTop: -height / 2.4,
          width,
          height,
        }}
      />
    )
  }
}

export default SpinnerCheckMark
