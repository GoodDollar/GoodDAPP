import React from 'react'
import Lottie from 'lottie-react-native'
import { TouchableOpacity } from 'react-native'
import animationData from './data.json'

class SaveButtonDisabled extends React.Component {
  render() {
    const { style = {} } = this.props
    return (
      <TouchableOpacity style={style} disabled>
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
