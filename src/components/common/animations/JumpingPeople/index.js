import React from 'react'
import Lottie from 'lottie-react-native'
import { View } from 'react-native'
import { getScreenWidth } from '../../../../lib/utils/Orientation'
import animationData from './data.json'

class JumpingPeople extends React.Component {
  getWidth = () => {
    let resultWidth = 630
    const layerWidth = animationData.w
    const screenWidth = getScreenWidth()
    if (screenWidth <= layerWidth) {
      resultWidth = screenWidth + screenWidth / 2.6
    }
    return resultWidth
  }

  getMarginLeft = () => {
    let resultWidth = 105
    const layerWidth = animationData.w
    const screenWidth = getScreenWidth()
    if (screenWidth <= layerWidth) {
      resultWidth = screenWidth / 4
    }
    return resultWidth
  }

  render() {
    return (
      <View
        style={{
          height: 100,
        }}
      >
        <Lottie
          imageAssetsFolder={'/assets'}
          enableMergePathsAndroidForKitKatAndAbove={true}
          autoPlay={true}
          source={animationData}
          autoSize={true}
          style={{
            position: 'absolute',
            marginTop: this.props.isCitizen ? -740 : -790,
            marginLeft: -this.getMarginLeft(),
            width: this.getWidth(),
          }}
          loop={false}
        />
      </View>
    )
  }
}

export default JumpingPeople
