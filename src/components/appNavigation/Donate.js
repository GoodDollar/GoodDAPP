import React from 'react'
import { View, Text } from 'react-native'
import { createStackNavigator } from './stackNavigation'

const Donate = () => (
  <View>
    <Text>Donate</Text>
  </View>
)

export default createStackNavigator({
  Donate
})
