import React from 'react'
import Lottie from 'lottie-react-native'

import AnimationBase from '../Base'
import { getAnimationData } from '../../../../lib/utils/lottie'
import { getDesignRelativeHeight, getDesignRelativeWidth } from '../../../../lib/utils/sizes'
import { isMobileNative } from '../../../../lib/utils/platform'
import { withStyles } from '../../../../lib/styles'
import data from './data'
const { animationData, imageAssetsFolder } = getAnimationData('Error', data)

class Error extends AnimationBase {
  render() {
    const { styles } = this.props
    return (
      <Lottie
        imageAssetsFolder={imageAssetsFolder}
        enableMergePathsAndroidForKitKatAndAbove={true}
        autoPlay={true}
        source={this.improveAnimationData(animationData)}
        autoSize={false}
        style={styles.animation}
        loop={false}
      />
    )
  }
}

const styles = ({ theme }) => {
  const topValue = isMobileNative ? 15 : 40
  return {
    animation: {
      top: -getDesignRelativeHeight(topValue, true),
      width: getDesignRelativeWidth(97, false),
      marginHorizontal: 'auto',
      marginVertical: 'auto',
      alignSelf: 'center',
    },
  }
}

export default withStyles(styles)(Error)
