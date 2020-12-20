import React from 'react'
import Lottie from 'lottie-react-native'
import { Platform, View } from 'react-native'
import { getDesignRelativeHeight } from '../../../../lib/utils/sizes'
import { withStyles } from '../../../../lib/styles'
import AnimationBase from '../Base'
import { getAnimationData } from '../../../../lib/utils/lottie'
const { animationData, imageAssetsFolder } = getAnimationData('Success', require('./data'))
class Success extends AnimationBase {
  render() {
    const { styles } = this.props
    return (
      <View style={styles.animationContainer}>
        <Lottie
          imageAssetsFolder={imageAssetsFolder}
          enableMergePathsAndroidForKitKatAndAbove={true}
          autoPlay={true}
          source={this.improveAnimationData(animationData)}
          style={styles.animation}
          loop={false}
          resizeMode="cover"
        />
      </View>
    )
  }
}

const animationStyles = () => ({
  animationContainer: {
    ...Platform.select({
      web: {
        height: 'auto',
        marginBottom: getDesignRelativeHeight(20),
      },
      default: {
        width: '100%',
        height: 200,
        justifyContent: 'center',
        alignItems: 'center',
      },
    }),
  },
  animation: {
    ...Platform.select({
      web: {
        height: 245,
      },
      default: {
        width: 200,
        height: 'auto',
        position: 'absolute',
      },
    }),
  },
})

export default withStyles(animationStyles)(Success)
