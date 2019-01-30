import React from 'react'
import { View, Text } from 'react-native'
import { createStackNavigator } from './stackNavigation'

const BuySell = props => {
  return (
    <View>
      <Text>BuySell</Text>
    </View>
  )
}

export default createStackNavigator({ BuySell })
