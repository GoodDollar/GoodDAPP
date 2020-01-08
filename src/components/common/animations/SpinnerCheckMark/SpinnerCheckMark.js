import React from 'react'
import Lottie from 'lottie-react-web'
import animationData from './data.json'

const spinnerSegment = [0, 131]
const finishSegment = [131, 290]
const defaultOptions = {
  animationData,
  autoplay: false,
  loop: true,
}
class SpinnerCheckMark extends React.Component {
  state = {
    animationSuccess: false,
  }

  constructor(props) {
    super(props)
    this.animationRef = React.createRef()
  }

  componentDidMount() {
    this.animationRef.current.anim.onEnterFrame = e => {
      const { success } = this.props
      const { animationSuccess } = this.state
      if (success && !animationSuccess) {
        this.animationRef.current.anim.playSegments(finishSegment)
        this.animationRef.current.anim.loop = false
        this.setState({ animationSuccess: true })
      }
    }
    this.animationRef.current.anim.onComplete = () => {
      const { onFinish } = this.props
      if (typeof onFinish === 'function') {
        onFinish()
      }
    }
    this.animationRef.current.anim.playSegments(spinnerSegment, true)
  }

  render() {
    const { height = 196, width = 196 } = this.props

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
