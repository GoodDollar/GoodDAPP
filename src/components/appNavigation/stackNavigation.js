// @flow
import React, { Component, useState, useEffect } from 'react'
import { Style } from 'react-native'
import { Button } from 'react-native-paper'
import { createNavigator, SwitchRouter, SceneView, Route } from '@react-navigation/core'
import { Helmet } from 'react-helmet'

import NavBar from './NavBar'
import { CustomButton, type ButtonProps } from '../common'
import logger from '../../lib/logger/pino-logger'

/**
 * getComponent gets the component and props and returns the same component except when
 * shouldNavigateToComponent is present in component and not complaining
 * This function can be written in every component that needs to prevent access
 * if there is not in a correct navigation flow.
 * Example: doesn't makes sense to navigate to Amount if there is no nextRoutes
 * @param {React.Component} Component
 */
const getComponent = (Component, props) => {
  const { shouldNavigateToComponent } = Component

  if (shouldNavigateToComponent && !shouldNavigateToComponent(props)) {
    return props => {
      useEffect(() => props.screenProps.goToParent(), [])
      return null
    }
  }
  return Component
}

/**
 * Component wrapping the stack navigator.
 * It holds the pop, push, gotToRoot and goToParent navigation logic and inserts on top the NavBar component.
 * Params are passed as initial state for next screen.
 * This navigation actions are being passed via navigationConfig to children components
 */

class AppView extends Component<{ descriptors: any, navigation: any, navigationConfig: any, screenProps: any }, any> {
  state = {
    stack: [],
    currentState: {}
  }
  /**
   * Pops from stack
   * If there is no screen on the stack navigates to initial screen on stack (goToRoot)
   * If we are currently in the first screen go to ths screen that created the stack (goToParent)
   */
  pop = () => {
    const { navigation } = this.props
    const nextRoute = this.state.stack.pop()
    if (nextRoute) {
      this.setState(state => {
        return { currentState: nextRoute.state }
      })
      navigation.navigate(nextRoute.route)
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
    this.setState(
      (state, props) => {
        return {
          stack: [
            ...state.stack,
            {
              route,
              state: state.currentState
            }
          ],
          currentState: params
        }
      },
      state => navigation.navigate(nextRoute)
    )
  }

  /**
   * Navigates to root screen. First on stack
   */
  goToRoot = () => {
    const { navigation } = this.props
    this.setState({
      stack: [],
      currentState: {}
    })
    navigation.navigate(navigation.state.routes[0])
  }

  /**
   * Navigates to specific screen with custom parameters as query string.
   */
  navigateTo = (routeName: string, params: any) => {
    this.props.navigation.navigate({
      routeName,
      params,
      type: 'Navigation/NAVIGATE'
    })
  }

  /**
   * Navigates to the screen that created the stack (backRouteName)
   */
  goToParent = () => {
    const { navigation, navigationConfig } = this.props

    if (navigationConfig.backRouteName) {
      this.setState({ currentState: {}, stack: [] })
      navigation.navigate(navigationConfig.backRouteName)
    }
  }

  /**
   * Screen states are being stored by this component
   * This way it can be kept between screens
   */
  setScreenState = data => {
    this.setState(state => ({ currentState: { ...state.currentState, ...data } }))
  }

  render() {
    const { descriptors, navigation, navigationConfig, screenProps: incomingScreenProps } = this.props
    const activeKey = navigation.state.routes[navigation.state.index].key
    const descriptor = descriptors[activeKey]
    const { title, navigationBarHidden, backButtonHidden } = descriptor.options
    const screenProps = {
      ...incomingScreenProps,
      navigationConfig,
      push: this.push,
      goToRoot: this.goToRoot,
      goToParent: this.goToParent,
      navigateTo: this.navigateTo,
      pop: this.pop,
      screenState: this.state.currentState,
      setScreenState: this.setScreenState
    }
    const Component = getComponent(descriptor.getComponent(), { screenProps })
    const pageTitle = title || activeKey
    return (
      <React.Fragment>
        <Helmet>
          <title>{`Good Dollar | ${pageTitle}`}</title>
        </Helmet>
        {!navigationBarHidden && <NavBar goBack={backButtonHidden ? undefined : this.pop} title={pageTitle} />}
        <SceneView navigation={descriptor.navigation} component={Component} screenProps={screenProps} />
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
    backRouteName: 'Home'
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
  screenProps: { goToParent: () => void }
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

type DoneButtonProps = {
  ...ButtonProps,
  routeName?: Route,
  screenProps: { goToRoot: () => void }
}

/**
 * BackButton
 * This button gets the goToParent action from screenProps. Is meant to be used inside a stackNavigator
 * @param {ButtonProps} props
 */
export const DoneButton = (props: DoneButtonProps) => {
  const { disabled, screenProps, children, mode, color, style } = props

  return (
    <CustomButton
      mode={mode || 'outlined'}
      color={color || '#575757'}
      style={style}
      disabled={disabled}
      onPress={screenProps.goToRoot}
    >
      {children || 'Done'}
    </CustomButton>
  )
}

type NextButtonProps = {
  ...ButtonProps,
  values: {},
  screenProps: { push: (routeName: string, params: any) => void },
  nextRoutes: [string],
  label?: string
}
/**
 * NextButton
 * This button gets the nextRoutes param and creates a Push to the next screen and passes the rest of the array which are
 * next screens for further Components. Is meant to be used inside a stackNavigator
 * @param {any} props
 */
export const NextButton = ({ disabled, values, screenProps, nextRoutes: nextRoutesParam, label }: NextButtonProps) => {
  const [next, ...nextRoutes] = nextRoutesParam ? nextRoutesParam : []
  return (
    <PushButton
      mode="contained"
      disabled={disabled || !next}
      screenProps={{ ...screenProps }}
      params={{ ...values, nextRoutes }}
      routeName={next}
      style={{ flex: 2 }}
    >
      {label || 'Next'}
    </PushButton>
  )
}

type UseScreenProps = { setScreenState?: {}, screenState?: {} }
/**
 * Hook to get screen state from stack or from useState hook if there is no setScreenState function
 */
export const useScreenState = ({ setScreenState, screenState }: UseScreenProps): any => {
  if (setScreenState) {
    return [screenState || {}, setScreenState]
  }
  const [state, setState] = useState<any>()
  return [state || {}, setState]
}
