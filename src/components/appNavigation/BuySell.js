import React from 'react'
import { ScrollView, View, Text } from 'react-native'
import { Link } from '@react-navigation/web'
import { createStackNavigator } from './stackNavigation'

const BuySell = props => {
  return (
    <ScrollView>
      <Text>BuySell</Text>
    </ScrollView>
  )
}

export default createStackNavigator({ BuySell })
