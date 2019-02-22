// @flow
import React, { Component } from 'react'
import { Style } from 'react-native'
import { Button } from 'react-native-paper'
import { createNavigator, SwitchRouter, SceneView, Route } from '@react-navigation/core'

import NavBar from './NavBar'
import { CustomButton, type ButtonProps } from '../common'

/**
 * Component wrapping the stack navigator.
 * It holds the pop, push, gotToRoot and goToParent navigation logic and inserts on top the NavBar component.
 * This navigation actions are being passed via navigationConfig to children components
 */
class AppView extends Component<{ descriptors: any, navigation: any, navigationConfig: any, screenProps: any }, any> {
  stack = []
  currentParams = {}
  state = {
    screenStates: {}
  }
  /**
   * Pops from stack
   * If there is no screen on the stack navigates to initial screen on stack (goToRoot)
   * If we are currently in the first screen go to ths screen that created the stack (goToParent)
   */
  pop = () => {
    const { navigation } = this.props
    const nextRoute = this.stack.pop()
    if (nextRoute) {
      const { route, params } = nextRoute
      this.currentParams = params
      navigation.navigate(route, params)
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
    const route = navigation.state.routes[navigation.state.index].key
    this.stack.push({
      route,
      params: this.currentParams
    })

    this.currentParams = params
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

  setScreenState = (screen, data) => {
    this.setState({ screenStates: { ...this.state.screenStates, [screen]: data } })
  }

  getScreenState = screen => this.state.screenStates[screen]

  render() {
    const { descriptors, navigation, navigationConfig, screenProps } = this.props
    const activeKey = navigation.state.routes[navigation.state.index].key
    const descriptor = descriptors[activeKey]
    const { title, navigationBarHidden } = descriptor.options
    return (
      <React.Fragment>
        {!navigationBarHidden && <NavBar goBack={this.pop} title={title || activeKey} />}
        <SceneView
          navigation={descriptor.navigation}
          component={descriptor.getComponent()}
          screenProps={{
            ...screenProps,
            navigationConfig,
            push: this.push,
            goToRoot: this.goToRoot,
            goToParent: this.goToParent,
            pop: this.pop,
            screenState: this.getScreenState(activeKey) || {},
            setScreenState: data => this.setScreenState(activeKey, data)
          }}
        />
      </React.Fragment>
    )
  }
}

/**
 * Returns a navigator with a navbar wrapping the routes.
 * This function is meant to be used to create a new stack navigation with the given routes.
 * @param {[Route]} routes: Array with routes in the stack
 * @param {Object} navigationConfig
 */
export const createStackNavigator = (routes: any, navigationConfig: any) => {
  const defaultNavigationConfig = {
    backRouteName: 'Dashboard'
  }

  return createNavigator(AppView, SwitchRouter(routes), { ...defaultNavigationConfig, ...navigationConfig })
}

type PushButtonProps = {
  ...ButtonProps,
  routeName: Route,
  params?: any,
  screenProps: { push: (routeName: string, params: any) => void }
}

/**
 * PushButton
 * This button gets the push action from screenProps. Is meant to be used inside a stackNavigator
 * @param routeName
 * @param screenProps
 * @param params
 * @param {ButtonProps} props
 */
export const PushButton = ({ routeName, screenProps, params, ...props }: PushButtonProps) => {
  return <CustomButton {...props} onPress={() => screenProps && screenProps.push(routeName, params)} />
}

PushButton.defaultProps = {
  mode: 'contained',
  dark: true
}

type BackButtonProps = {
  ...ButtonProps,
  routeName?: Route,
  screenProps: {}
}

/**
 * BackButton
 * This button gets the goToParent action from screenProps. Is meant to be used inside a stackNavigator
 * @param {ButtonProps} props
 */
export const BackButton = (props: BackButtonProps) => {
  const { disabled, screenProps, children, mode, color, style } = props

  return (
    <Button
      mode={mode || 'text'}
      color={color || '#575757'}
      style={style}
      disabled={disabled}
      onPress={screenProps.goToParent}
    >
      {children}
    </Button>
  )
}

export const NextButton = ({ required, value, screenProps, navigation }) => {
  const { nextRoutes: nextRoutesParam, ...params } = navigation.state.params || {}
  const [next, ...nextRoutes] = nextRoutesParam

  return (
    <PushButton
      mode="contained"
      disabled={required && !value}
      screenProps={{ ...screenProps }}
      params={{ ...params, value, nextRoutes }}
      routeName={next}
      style={{ flex: 2 }}
    >
      Next
    </PushButton>
  )
}
