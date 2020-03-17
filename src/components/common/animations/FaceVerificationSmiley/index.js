import React from 'react'
import { Platform } from 'react-native'
import Lottie from 'lottie-react-native'
import { getScreenHeight } from '../../../../lib/utils/Orientation'
import { getAnimationData } from '../../../../lib/utils/lottie'

const { animationData, imageAssetsFolder } = getAnimationData('FaceVerificationSmiley', require('./data'))

const margin = getScreenHeight() > 700 ? 175 : getScreenHeight() / 2.3

const styles = {
  android: {},
  ios: {},
  web: {
    marginTop: -margin,
    marginBottom: -margin,
  },
}

class FaceVerificationSmiley extends React.Component {
  render() {
    return (
      <Lottie
        imageAssetsFolder={imageAssetsFolder}
        enableMergePathsAndroidForKitKatAndAbove={true}
        autoPlay={true}
        source={animationData}
        autoSize={true}
        style={Platform.select(styles)}
        loop={false}
      />
    )
  }
}

export default FaceVerificationSmiley
