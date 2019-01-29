// @flow
import React, { Component } from 'react'

import { createNavigator, SwitchRouter, SceneView, Route } from '@react-navigation/core'
import { View, StyleSheet } from 'react-native'

import NavBar from './NavBar'
import { Button } from 'react-native-paper'

class AppView extends Component<{ descriptors: any, navigation: any, navigationConfig: any }> {
  stack = []

  pop = () => {
    const { navigation, navigationConfig } = this.props

    const nextRoute = this.stack.pop()
    if (nextRoute) {
      navigation.navigate(nextRoute)
    } else if (navigation.state.index !== 0) {
      navigation.navigate(navigation.state.routes[0])
    } else if (navigationConfig.backRouteName) {
      navigation.navigate(navigationConfig.backRouteName)
    }
  }

  push = (nextRoute, params) => {
    const { navigation } = this.props
    const activeKey = navigation.state.routes[navigation.state.index].key
    this.stack.push(activeKey)
    navigation.navigate(nextRoute, params)
  }

  render() {
    const { descriptors, navigation, navigationConfig } = this.props
    const activeKey = navigation.state.routes[navigation.state.index].key
    const descriptor = descriptors[activeKey]
    const { title } = descriptor.options
    return (
      <View>
        <NavBar pop={this.pop} title={title || activeKey} />
        <SceneView
          navigation={descriptor.navigation}
          component={descriptor.getComponent()}
          screenProps={{ ...navigationConfig, push: this.push }}
        />
      </View>
    )
  }
}

export const createStackNavigator = (routes: [Route], navigationConfig: any) => {
  const defaultNavigationConfig = {
    backRouteName: 'Dashboard'
  }
  return createNavigator(AppView, SwitchRouter(routes), { ...navigationConfig, ...defaultNavigationConfig })
}

type PushButtonProps = { navigationConfig: any, routeName: Route, children: any }
export const PushButton = ({ navigationConfig, routeName, children }: PushButtonProps) => {
  return (
    <Button style={styles.pushButton} onClick={() => navigationConfig.push(routeName)}>
      {children}
    </Button>
  )
}

const styles = StyleSheet.create({
  pushButton: {
    cursor: 'pointer'
  }
})
