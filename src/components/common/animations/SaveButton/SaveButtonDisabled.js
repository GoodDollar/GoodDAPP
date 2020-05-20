import React from 'react'
import Lottie from 'lottie-react-native'
import { TouchableOpacity } from 'react-native'
import { cloneDeep } from 'lodash'

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
          source={cloneDeep(animationData)}
          style={{
            width: '100%',
          }}
        />
      </TouchableOpacity>
    )
  }
}

export default SaveButtonDisabled
