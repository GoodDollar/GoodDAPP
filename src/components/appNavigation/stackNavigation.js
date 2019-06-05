// @flow
import React, { Component, useState, useEffect } from 'react'
import { ScrollView, View } from 'react-native'
import { Button } from 'react-native-paper'
import SideMenu from 'react-native-side-menu'
import { createNavigator, SwitchRouter, SceneView, Route } from '@react-navigation/core'
import { navigationOptions } from './navigationConfig'
import GDStore from '../../lib/undux/GDStore'
import { toggleSidemenu } from '../../lib/undux/utils/sidemenu'
import SideMenuPanel from '../sidemenu/SideMenuPanel'
import logger from '../../lib/logger/pino-logger'
import NavBar from './NavBar'
import { CustomButton, type ButtonProps } from '../common'
import { scrollableContainer } from '../common/styles'

export const DEFAULT_PARAMS = {
  event: undefined,
  receiveLink: undefined,
  reason: undefined,
  code: undefined
}

const log = logger.child({ from: 'stackNavigation' })

type AppViewProps = {
  descriptors: any,
  navigation: any,
  navigationConfig: any,
  screenProps: any,
  store: GDStore
}

type AppViewState = {
  stack: Array<any>,
  currentState: any
}

/**
 * Component wrapping the stack navigator.
 * It holds the pop, push, gotToRoot and goToParent navigation logic and inserts on top the NavBar component.
 * Params are passed as initial state for next screen.
 * This navigation actions are being passed via navigationConfig to children components
 */
class AppView extends Component<AppViewProps, AppViewState> {
  state = {
    stack: [],
    currentState: {}
  }
  /**
   * marks route transistion
   */
  trans: boolean = false

  shouldComponentUpdate() {
    return this.trans === false
  }

  /**
   * getComponent gets the component and props and returns the same component except when
   * shouldNavigateToComponent is present in component and not complaining
   * This function can be written in every component that needs to prevent access
   * if there is not in a correct navigation flow.
   * Example: doesn't makes sense to navigate to Amount if there is no nextRoutes
   * @param {React.Component} Component
   */
  getComponent = (Component, props) => {
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
   * Pops from stack
   * If there is no screen on the stack navigates to initial screen on stack (goToRoot)
   * If we are currently in the first screen go to ths screen that created the stack (goToParent)
   * we can use this to navigate back to previous screen with adding new params
   *
   * @param {object} params new params to add to previous screen screenState
   */
  pop = (params?: any) => {
    const { navigation } = this.props
    const nextRoute = this.state.stack.pop()
    if (nextRoute) {
      this.trans = true
      this.setState({ currentState: { ...nextRoute.state, ...params, route: nextRoute.route } }, () => {
        navigation.navigate(nextRoute.route)
        this.trans = false
      })
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
    this.trans = true
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
          currentState: { ...params, route }
        }
      },
      state => {
        navigation.navigate(nextRoute)
        this.trans = false
      }
    )
  }

  /**
   * Navigates to root screen. First on stack
   */
  goToRoot = () => {
    const { navigation } = this.props
    this.trans = true
    this.setState({
      stack: [],
      currentState: {}
    })

    const route = navigation.state.routes[0]
    route.params = {
      ...route.params,
      ...DEFAULT_PARAMS
    }

    navigation.navigate(route)
    this.trans = false
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
      this.trans = true
      this.setState({ currentState: {}, stack: [] })
      navigation.navigate(navigationConfig.backRouteName)
      this.trans = false
    }
  }

  /**
   * Screen states are being stored by this component
   * This way it can be kept between screens
   */
  setScreenState = data => {
    this.setState(state => ({ currentState: { ...state.currentState, ...data } }))
  }

  handleSidemenuVisibility = () => toggleSidemenu(this.props.store)

  render() {
    const { descriptors, navigation, navigationConfig, screenProps: incomingScreenProps, store } = this.props
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
      setScreenState: this.setScreenState,
      toggleMenu: () => this.drawer.open()
    }
    log.info('stackNavigation Render: FIXME rerender', descriptor, activeKey, this.props, this.state)
    const Component = this.getComponent(descriptor.getComponent(), { screenProps })
    const pageTitle = title || activeKey
    const open = store.get('sidemenu').visible
    const menu = open ? <SideMenuPanel navigation={navigation} /> : null
    return (
      <React.Fragment>
        {!navigationBarHidden && <NavBar goBack={backButtonHidden ? undefined : this.pop} title={pageTitle} />}
        <View style={{ backgroundColor: '#fff', flex: 1 }}>
          <SideMenu menu={menu} menuPosition="right" isOpen={store.get('sidemenu').visible}>
            <ScrollView contentContainerStyle={scrollableContainer}>
              <SceneView navigation={descriptor.navigation} component={Component} screenProps={screenProps} />
            </ScrollView>
          </SideMenu>
        </View>
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

  return createNavigator(GDStore.withStore(AppView), SwitchRouter(routes), {
    ...defaultNavigationConfig,
    ...navigationConfig,
    navigationOptions
  })
}

type PushButtonProps = {
  ...ButtonProps,
  routeName: Route,
  params?: any,
  screenProps: { push: (routeName: string, params: any) => void },
  canContinue?: Function
}

/**
 * PushButton
 * This button gets the push action from screenProps. Is meant to be used inside a stackNavigator
 * @param routeName
 * @param screenProps
 * @param params
 * @param {ButtonProps} props
 */
export const PushButton = ({ routeName, screenProps, canContinue, params, ...props }: PushButtonProps) => {
  const shouldContinue = async () => {
    if (canContinue === undefined) return true

    const result = await canContinue()
    return result
  }

  return (
    <CustomButton
      {...props}
      onPress={async () => screenProps && (await shouldContinue()) && screenProps.push(routeName, params)}
    />
  )
}

PushButton.defaultProps = {
  mode: 'contained',
  dark: true,
  canContinue: () => true
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
      compact={true}
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
  label?: string,
  canContinue?: Function
}

/**
 * NextButton
 * This button gets the nextRoutes param and creates a Push to the next screen and passes the rest of the array which are
 * next screens for further Components. Is meant to be used inside a stackNavigator
 * @param {any} props
 */
export const NextButton = ({
  disabled,
  values,
  screenProps,
  nextRoutes: nextRoutesParam,
  label,
  canContinue
}: NextButtonProps) => {
  const [next, ...nextRoutes] = nextRoutesParam ? nextRoutesParam : []
  return (
    <PushButton
      mode="contained"
      disabled={disabled || !next}
      screenProps={{ ...screenProps }}
      params={{ ...values, nextRoutes }}
      routeName={next}
      style={{ flex: 2 }}
      canContinue={canContinue}
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
