import React from 'react'
import Lottie from 'lottie-react-native'
import { Platform, View } from 'react-native'
import { getScreenWidth } from '../../../../lib/utils/Orientation'
import { getAnimationData } from '../../../../lib/utils/lottie'

const { animationData, imageAssetsFolder } = getAnimationData('JumpingPeople', require('./data'))

const getWidth = () => {
  let resultWidth = 630
  const layerWidth = animationData.w
  const screenWidth = getScreenWidth()
  if (screenWidth <= layerWidth) {
    resultWidth = screenWidth + screenWidth / 2.6
  }
  return resultWidth
}

const getMarginLeft = () => {
  let resultWidth = 105
  const layerWidth = animationData.w
  const screenWidth = getScreenWidth()
  if (screenWidth <= layerWidth) {
    resultWidth = screenWidth / 4
  }
  return resultWidth
}

const styles = {
  android: {
    position: 'absolute',
    width: 500,
    marginTop: -150,
    marginLeft: -40,
  },
  ios: {},
  web: {
    position: 'absolute',
    marginLeft: getMarginLeft(),
    width: getWidth(),
  },
}

const stylesBlock = {
  android: {
    height: 300,
  },
  ios: {},
  web: {
    height: 100,
  },
}
class JumpingPeople extends React.Component {
  render() {
    return (
      <View style={Platform.select(stylesBlock)}>
        <Lottie
          imageAssetsFolder={imageAssetsFolder}
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
