import React from 'react'
import { Platform, View } from 'react-native'
import Lottie from 'lottie-react-native'
import { getAnimationData } from '../../../../lib/utils/lottie'
const { animationData, imageAssetsFolder } = getAnimationData('Error', require('./data'))

const styles = {
  android: {
    flex: 1,
    width: 200,
    paddingVertical: 50,
    marginHorizontal: 'auto',
    marginBottom: 10,
  },
  ios: {
    flex: 1,
    width: '100%',
    paddingVertical: 50,
    marginHorizontal: 'auto',
    marginBottom: 10,
  },
  web: {
    width: 200,
    paddingVertical: 20,
    marginHorizontal: 'auto',
  },
}

class Error extends React.Component {
  render() {
    return (
      <View style={Platform.select(styles)}>
        <Lottie
          imageAssetsFolder={imageAssetsFolder}
          enableMergePathsAndroidForKitKatAndAbove={true}
          autoPlay={true}
          source={animationData}
          autoSize={false}
          loop={false}
        />
      </View>
    )
  }
}

export default Error
