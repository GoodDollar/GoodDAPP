import React from 'react'
import Lottie from 'lottie-react-native'
import { TouchableOpacity } from 'react-native'

import AnimationBase from '../Base'

import animationData from './data.json'

class SaveButtonDisabled extends AnimationBase {
  render() {
    const { style = {} } = this.props
    return (
      <TouchableOpacity style={style} disabled>
        <Lottie
          loop={false}
          play={false}
          source={this.improveAnimationData(animationData)}
          style={{
            width: '100%',
          }}
        />
      </TouchableOpacity>
    )
  }
}

export default SaveButtonDisabled
