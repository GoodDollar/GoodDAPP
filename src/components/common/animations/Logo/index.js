import React from 'react'
import Lottie from 'lottie-react-native'
import { isMobile } from 'mobile-device-detect'
import { getScreenHeight, getScreenWidth } from '../../../../lib/utils/Orientation'
import { getAnimationData } from '../../../../lib/utils/lottie'
const { animationData, imageAssetsFolder } = getAnimationData('Logo', require('./data'))

class Logo extends React.Component {
  setAnim = anim => {
    this.anim = anim
  }

  componentDidMount() {
    if (this.props.animation) {
      this.anim.play()
    } else {
      this.anim.goToAndStop(5200)
    }
  }

  render() {
    return (
      <Lottie
        ref={this.setAnim}
        imageAssetsFolder={imageAssetsFolder}
        enableMergePathsAndroidForKitKatAndAbove={true}
        source={animationData}
        autoSize={false}
        style={
          isMobile && {
            height: getScreenHeight() - 50,
            width: getScreenWidth(),
          }
        }
        loop={false}
      />
    )
  }
}

export default Logo
