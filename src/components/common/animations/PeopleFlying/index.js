import { Platform, View } from 'react-native'
import React from 'react'
import Lottie from 'lottie-react-native'

import { getAnimationData } from '../../../../lib/utils/lottie'
import { getScreenHeight, getScreenWidth } from '../../../../lib/utils/Orientation'

const { animationData, imageAssetsFolder } = getAnimationData('PeopleFlying', require('./data'))

const styles = {
  android: {
    width: getScreenWidth() - 15,
    marginTop: -(getScreenHeight() / 4),
    position: 'absolute',
  },
  ios: {
    width: getScreenWidth(),
    marginTop: -(getScreenHeight() / 7),
    position: 'absolute',
  },
  web: {
    marginTop: -515,
    position: 'absolute',
  },
}

class PeopleFlying extends React.Component {
  render() {
    return (
      <View>
        <Lottie
          imageAssetsFolder={imageAssetsFolder}
          enableMergePathsAndroidForKitKatAndAbove={true}
          autoPlay={true}
          source={animationData}
          style={Platform.select(styles)}
          loop={false}
        />
      </View>
    )
  }
}

export default PeopleFlying
