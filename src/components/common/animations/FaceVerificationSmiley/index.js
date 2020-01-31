import React from 'react'
import Lottie from 'lottie-react-native'
import { getScreenHeight } from '../../../../lib/utils/Orientation'
import animationData from './data.json'
class FaceVerificationSmiley extends React.Component {
  render() {
    const margin = getScreenHeight() > 700 ? 175 : getScreenHeight() / 2.3
    return (
      <Lottie
        imageAssetsFolder={'/assets'}
        enableMergePathsAndroidForKitKatAndAbove={true}
        autoPlay={true}
        source={animationData}
        autoSize={true}
        style={{
          marginTop: -margin,
          marginBottom: -margin,
        }}
        loop={false}
      />
    )
  }
}

export default FaceVerificationSmiley
