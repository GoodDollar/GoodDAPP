import React from 'react'
import Lottie from 'lottie-react-native'
import { View } from 'react-native'
import animationData from './data.json'
class PeopleFlying extends React.Component {
  render() {
    return (
      <View>
        <Lottie
          imageAssetsFolder={'/assets'}
          enableMergePathsAndroidForKitKatAndAbove={true}
          autoPlay={true}
          source={animationData}
          renderer={'svg'}
          style={{
            marginTop: -515,
            position: 'absolute',
          }}
          loop={false}
        />
      </View>
    )
  }
}

export default PeopleFlying
