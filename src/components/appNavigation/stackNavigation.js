// @flow
import React, { Component } from 'react'

import { createNavigator, SwitchRouter, SceneView } from '@react-navigation/core'
import { View } from 'react-native'

import NavBar from './NavBar'

class AppView extends Component<{ descriptors: any, navigation: any, navigationConfig: any }> {
  stack = []

  pop = () => {
    const { navigation, navigationConfig } = this.props

    const nextRoute = this.stack.pop()
    if (nextRoute) {
      navigation.navigate(nextRoute.key)
    } else if (navigation.state.index !== 0) {
      navigation.navigate(navigation.state.routes[0].key)
    } else if (navigationConfig.backRouteName) {
      navigation.navigate(navigationConfig.backRouteName)
    }
  }

  push = nextRoute => {
    const { navigation } = this.props
    const activeKey = navigation.state.routes[navigation.state.index].key
    this.stack.push(activeKey)
    navigation.navigate(nextRoute)
  }

  render() {
    const { descriptors, navigation, navigationConfig } = this.props
    console.log('this.props', this.props)
    console.log('stack', this.stack)
    const activeKey = navigation.state.routes[navigation.state.index].key
    const descriptor = descriptors[activeKey]
    return (
      <View>
        <NavBar pop={this.pop} />
        <SceneView
          navigation={descriptor.navigation}
          component={descriptor.getComponent()}
          screenProps={{ navigationOptions: navigationConfig.navigationOptions }}
        />
      </View>
    )
  }
}

export const createStackNavigator = (routes: any, navigationOptions: any) => {
  return createNavigator(AppView, SwitchRouter(routes), { ...navigationOptions, backRouteName: 'Dashboard' })
}
