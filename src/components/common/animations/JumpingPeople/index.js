import React from 'react'
import Lottie from 'lottie-react-native'
import { Platform, View } from 'react-native'
import { getDesignRelativeHeight } from '../../../../lib/utils/sizes'
import { getScreenHeight } from '../../../../lib/utils/Orientation'
import { getAnimationData } from '../../../../lib/utils/lottie'

const { animationData, imageAssetsFolder } = getAnimationData('JumpingPeople', require('./data'))

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
    marginTop: -(getScreenHeight() / getDesignRelativeHeight(getScreenHeight() > 800 ? 3.3 : 2.7)),
    width: '100%',
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
