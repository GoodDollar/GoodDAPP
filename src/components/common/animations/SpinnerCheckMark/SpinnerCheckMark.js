import React from 'react'
import Lottie from 'react-lottie'
import animationData from './data.json'

class SpinnerCheckMark extends React.Component {
  constructor(props) {
    super(props)
    this.animationRef = React.createRef()
  }

  componentDidMount() {
    this.animationRef.current.anim.onEnterFrame = e => {
      const { success } = this.props
      if (e.currentTime > 130.5 && !success) {
        this.animationRef.current.anim.goToAndPlay(0, true)
      }
    }
    this.animationRef.current.anim.onComplete = () => {
      const { onFinish } = this.props
      if (typeof onFinish === 'function') {
        onFinish()
      }
    }
  }

  render() {
    const { height = 196, width = 196 } = this.props
    const defaultOptions = {
      animationData,
      loop: false,
    }

    return (
      <Lottie
        style={{
          marginTop: -height / 2.4,
        }}
        options={defaultOptions}
        ref={this.animationRef}
        animationData={animationData}
        height={height}
        width={width}
      />
    )
  }
}

export default SpinnerCheckMark
