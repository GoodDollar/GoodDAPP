import React from 'react'
import Lottie from 'lottie-react-native'
import { View } from 'react-native'
import animationData from './data.json'

class SpinnerCheckMark extends React.Component {
  componentDidMount() {
    this.anim.play()
  }

  setAnim = anim => {
    this.anim = anim
  }

  render() {
    const { height = 34, width = 34, style = {} } = this.props

    return (
      <View style={style}>
        <Lottie
          ref={this.setAnim}
          source={animationData}
          style={{
            width,
            height,
          }}
          loop={false}
        />
      </View>
    )
  }
}

export default SpinnerCheckMark
