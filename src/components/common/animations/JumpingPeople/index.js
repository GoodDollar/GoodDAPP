import React from 'react'
import Lottie from 'lottie-react-native'
import { Platform, View } from 'react-native'

import animationData from './data.json'

const styles = {
  android: {
    width: '100%',
    position: 'absolute',
    marginTop: -110,
  },
  ios: {
    position: 'absolute',
    marginTop: -70,
    width: '100%',
  },
  web: {
    width: '100%',
    position: 'absolute',
    marginTop: -270,
  },
}
const stylesBlock = {
  android: {
    width: '100%',
    height: 100,
  },
  ios: {
    width: '100%',
    height: 100,
  },
  web: {
    width: '100%',
    height: 100,
  },
}
class JumpingPeople extends React.Component {
  render() {
    return (
      <View style={Platform.select(stylesBlock)}>
        <Lottie
          enableMergePathsAndroidForKitKatAndAbove={true}
          autoPlay={true}
          source={animationData}
          autoSize={true}
          style={Platform.select(styles)}
          loop={false}
        />
      </View>
    )
  }
}

export default JumpingPeople
