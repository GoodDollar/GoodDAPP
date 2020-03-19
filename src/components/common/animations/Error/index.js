import React from 'react'
import { View } from 'react-native'
import Lottie from 'lottie-react-native'
import { getAnimationData } from '../../../../lib/utils/lottie'
const { animationData, imageAssetsFolder } = getAnimationData('Error', require('./data'))

class Error extends React.Component {
  render() {
    return (
      <View
        style={{
          flex: 1,
          width: 200,
          paddingVertical: 20,
          marginHorizontal: 'auto',
        }}
      >
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
