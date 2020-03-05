import React from 'react'
import Lottie from 'lottie-react-native'
import { Platform, View } from 'react-native'
import { getScreenHeight, getScreenWidth } from '../../../../lib/utils/Orientation'

import animationData from './data.json'

const getMarginTop = () => {
  const width = getScreenWidth()
  if (width < 600) {
    return -width / 1.3
  }
  return -width / 2.5
}

const styles = {
  android: {
    position: 'absolute',
    width: '100%',
    marginTop: -getScreenHeight() / 25,
  },
  ios: {
    position: 'absolute',
    width: '100%',
    marginTop: -getScreenHeight() / 25,
  },
  web: {
    width: '100%',
    position: 'absolute',
    marginTop: getMarginTop(),
  },
}
const stylesBlock = {
  android: {
    height: 300,
  },
  ios: {
    height: 300,
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
