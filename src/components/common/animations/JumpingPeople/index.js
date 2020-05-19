import React from 'react'
import Lottie from 'lottie-react-native'
import { Platform, View } from 'react-native'
import { isMobileOnly } from 'mobile-device-detect'
import { cloneDeep } from 'lodash'

import AnimationBase from '../Base'
import { getDesignRelativeHeight } from '../../../../lib/utils/sizes'

import animationData from './data.json'

const styles = {
  android: {
    width: '100%',
    position: 'absolute',
    marginTop: -110,
  },
  ios: {
    position: 'absolute',
    marginTop: -70,
    width: '100%',
  },
  web: {
    width: '100%',
    marginBottom: isMobileOnly ? getDesignRelativeHeight(5) : -getDesignRelativeHeight(20),
  },
}
const stylesBlock = {
  android: {
    width: '100%',
    height: 100,
  },
  ios: {
    width: '100%',
    height: 100,
  },
  web: {
    width: '100%',
    height: 100,
    justifyContent: 'flex-end',
    marginTop: isMobileOnly ? 0 : getDesignRelativeHeight(50),
  },
}

class JumpingPeople extends AnimationBase {
  render() {
    return (
      <View style={Platform.select(stylesBlock)}>
        <Lottie
          enableMergePathsAndroidForKitKatAndAbove={true}
          autoPlay={true}
          source={cloneDeep(animationData)}
          autoSize={true}
          style={Platform.select(styles)}
          loop={false}
        />
      </View>
    )
  }
}

export default JumpingPeople
