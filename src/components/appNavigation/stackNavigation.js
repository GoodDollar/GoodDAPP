// @flow
import React, { Component } from 'react'

import { createNavigator, SwitchRouter, SceneView, Route } from '@react-navigation/core'
import { View } from 'react-native'

import NavBar from './NavBar'
import { Button } from 'react-native-paper'

/**
 * Component wrapping the stack navigator.
 * It holds the pop push gotToRoot goToParent logic and inserts on top the NavBar component.
 * This navigation actions are being passed via navigationConfig to children components
 */
class AppView extends Component<{ descriptors: any, navigation: any, navigationConfig: any }> {
  stack = []

  /**
   * Pops from stack
   * If there is no screen on the stack navigates to initial screen on stack (goToRoot)
   * If we are currently in the first screen go to ths screen that created the stack (toToParent)
   */
  pop = () => {
    const { navigation } = this.props

    const nextRoute = this.stack.pop()
    if (nextRoute) {
      navigation.navigate(nextRoute)
    } else if (navigation.state.index !== 0) {
      this.goToRoot()
    } else {
      this.goToParent()
    }
  }

  /**
   * Push a route to the stack
   * The stack is maintained in stack property to be able to navigate back and forward
   */
  push = (nextRoute, params) => {
    const { navigation } = this.props
    const activeKey = navigation.state.routes[navigation.state.index].key
    this.stack.push(activeKey)
    navigation.navigate(nextRoute, params)
  }

  /**
   * Navigates to root screen. First on stack
   */
  goToRoot = () => {
    const { navigation } = this.props
    navigation.navigate(navigation.state.routes[0])
  }

  /**
   * Navigates to the screen that created the stack (backRouteName)
   */
  goToParent = () => {
    const { navigation, navigationConfig } = this.props

    if (navigationConfig.backRouteName) {
      navigation.navigate(navigationConfig.backRouteName)
    }
  }

  render() {
    const { descriptors, navigation, navigationConfig } = this.props
    const activeKey = navigation.state.routes[navigation.state.index].key
    const descriptor = descriptors[activeKey]
    const { title } = descriptor.options
    return (
      <View>
        <NavBar goBack={this.pop} title={title || activeKey} />
        <SceneView
          navigation={descriptor.navigation}
          component={descriptor.getComponent()}
          screenProps={{ ...navigationConfig, push: this.push, goToRoot: this.goToRoot, goToParent: this.goToParent }}
        />
      </View>
    )
  }
}

/**
 * Returns a navigator with a navbar wrapping the routes.
 * This function is meant to be used to create a new stack navigation with the given routes.
 * @param {[Route]} routes: Array with routes in the stack
 * @param {Object} navigationConfig
 */
export const createStackNavigator = (routes: [Route], navigationConfig: any) => {
  const defaultNavigationConfig = {
    backRouteName: 'Dashboard'
  }
  return createNavigator(AppView, SwitchRouter(routes), { ...navigationConfig, ...defaultNavigationConfig })
}

type ButtonProps = {
  navigationConfig: any,
  routeName: Route,
  children: any,
  text: string,
  disabled: boolean,
  mode: string,
  color: string
}
/**
 * PushButton
 * This button gets the push action from navigationConfig. Is meant to be used inside a stackNavigator
 * @param {ButtonProps} props
 */
export const PushButton = (props: ButtonProps) => {
  const { disabled, navigationConfig, routeName, children, mode, color } = props
  return (
    <Button
      mode={mode || 'contained'}
      color={color || 'black'}
      disabled={disabled}
      onPress={() => navigationConfig.push(routeName)}
    >
      {children}
    </Button>
  )
}

/**
 * BackButton
 * This button gets the goToParent action from navigationConfig. Is meant to be used inside a stackNavigator
 * @param {ButtonProps} props
 */
export const BackButton = (props: ButtonProps) => {
  const { disabled, navigationConfig, children, mode, color } = props
  return (
    <Button mode={mode || 'text'} color={color || '#575757'} disabled={disabled} onPress={navigationConfig.goToParent}>
      {children}
    </Button>
  )
}
