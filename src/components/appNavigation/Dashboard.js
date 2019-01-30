import React from 'react'
import { View, Text } from 'react-native'
import TabsView from './TabsView'

export default props => {
  const { screenProps } = props
  return (
    <View>
      <TabsView goTo={props.navigation.navigate} routes={screenProps.routes} />
      <Text>Dashboard</Text>
    </View>
  )
}
