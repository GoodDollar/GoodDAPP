import React from 'react'
import { View, Text } from 'react-native'
import { Link } from '@react-navigation/web'
import { createStackNavigator } from './stackNavigation'

const InternalReward = props => (
  <View>
    <Text>InternalReward Screen</Text>
  </View>
)
const Rewards = props => {
  return (
    <View>
      <Text>Rewards Screen</Text>
      <Link routeName={'InternalReward'} navigation={props.navigation}>
        InternalReward
      </Link>
    </View>
  )
}

export default createStackNavigator({
  Rewards,
  InternalReward
})
