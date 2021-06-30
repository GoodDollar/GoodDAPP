// @flow
import React from 'react'
import Lottie from 'lottie-react-native'

import { withStyles } from '../../../../lib/styles'
import AnimationBase from '../../animations/Base'
import { getAnimationData } from '../../../../lib/utils/lottie'
import { getDesignRelativeWidth } from '../../../../lib/utils/sizes'

const { animationData, imageAssetsFolder } = getAnimationData('Success', require('./data'))

class SuccessIcon extends AnimationBase {
  render() {
    const { styles } = this.props
    return (
      <Lottie
        imageAssetsFolder={imageAssetsFolder}
        enableMergePathsAndroidForKitKatAndAbove={true}
        autoPlay={true}
        source={this.improveAnimationData(animationData)}
        autoSize={false}
        loop={false}
        style={styles.animation}
      />
    )
  }
}

const styles = ({ theme }) => {
  return {
    animation: {
      width: getDesignRelativeWidth(97, false),
      marginHorizontal: 'auto',
      marginVertical: 'auto',
      alignSelf: 'center',
    },
  }
}

export default withStyles(styles)(SuccessIcon)
