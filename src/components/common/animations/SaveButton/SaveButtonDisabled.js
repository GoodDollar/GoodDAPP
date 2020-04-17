import React from 'react'
import Lottie from 'lottie-react-native'
import { TouchableOpacity } from 'react-native'
import AnimationBase from '../Base'
import animationData from './data.json'

class SaveButtonDisabled extends AnimationBase {
  render() {
    const { style = {}, onPress } = this.props
    return (
      <TouchableOpacity style={style} disabled={true} onPress={onPress}>
        <Lottie
          loop={false}
          play={false}
          source={animationData}
          style={{
            width: '100%',
          }}
        />
      </TouchableOpacity>
    )
  }
}

export default SaveButtonDisabled
