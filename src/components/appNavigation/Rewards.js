import React from 'react'
import { View, Text } from 'react-native'
import { Link } from '@react-navigation/web'
import { createStackNavigator, PushButton } from './stackNavigation'
class InternalReward2 extends React.Component {
  // This is one way of setting params for screen
  // More useful if the params are the same for all instances of this component regarding how is included in the stack
  static navigationOptions = {
    title: 'Internal Reward Screen 2'
  }

  render() {
    return (
      <View>
        <Text>Internal Reward Screen 2 </Text>
      </View>
    )
  }
}

const InternalReward1 = props => (
  <View>
    <Text>InternalReward Screen 1</Text>
    <PushButton routeName={'InternalReward2'} navigationConfig={props.screenProps}>
      InternalReward 2
    </PushButton>
  </View>
)

const Rewards = props => {
  console.log('Rewards props', props)
  return (
    <View>
      <Text>Rewards Screen</Text>
      <PushButton routeName={'InternalReward1'} navigationConfig={props.screenProps}>
        InternalReward 1
      </PushButton>
    </View>
  )
}

export default createStackNavigator({
  Rewards,
  InternalReward1: {
    screen: InternalReward1,
    // This is one way of setting params for screen.
    // More useful if the params may change for the same component
    navigationOptions: { title: 'Internal Reward Title 1' }
  },
  InternalReward2
})
