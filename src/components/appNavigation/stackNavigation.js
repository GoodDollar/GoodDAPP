// @flow
import React, { Component, useEffect, useState } from 'react'
import { Platform, SafeAreaView, ScrollView, StyleSheet, View } from 'react-native'
import SideMenu from 'react-native-side-menu-gooddapp'
import { createNavigator, Route, SceneView, SwitchRouter } from '@react-navigation/core'
import { withStyles } from '../../lib/styles'
import { getScreenWidth } from '../../lib/utils/Orientation'
import SimpleStore from '../../lib/undux/SimpleStore'
import normalize from '../../lib/utils/normalizeText'
import SideMenuPanel from '../sidemenu/SideMenuPanel'
import logger from '../../lib/logger/pino-logger'
import CustomButton, { type ButtonProps } from '../common/buttons/CustomButton'
import Blurred from '../common/view/Blur/Blurred'
import BackButtonHandler from '../../lib/utils/handleBackButton'
import NavBar from './NavBar'
import { navigationOptions } from './navigationConfig'
import { PushButton } from './PushButton'

export const DEFAULT_PARAMS = {
  event: undefined,
  receiveLink: undefined,
  reason: undefined,
  code: undefined,
}

const log = logger.child({ from: 'stackNavigation' })

type AppViewProps = {
  descriptors: any,
  navigation: any,
  navigationConfig: any,
  screenProps: any,
  store: SimpleStore,
}

type AppViewState = {
  stack: Array<any>,
  currentState: any,
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
    currentState: {},
  }

  /**
   * marks route transistion
   */
  trans: boolean = false

  shouldComponentUpdate() {
    return this.trans === false
  }

  /**
   * handler for back Button on Android
   */
  backButtonHandler = null

  componentDidMount() {
    this.backButtonHandler = new BackButtonHandler({ defaultAction: this.pop })
  }

  componentWillUnmount() {
    this.backButtonHandler.unregister()
  }

  /**
   * getComponent gets the component and props and returns the same component except when
   * shouldNavigateToComponent is present in component and not complaining
   * This function can be written in every component that needs to prevent access
   * if there is not in a correct navigation flow.
   * Example: doesn't makes sense to navigate to Amount if there is no nextRoutes
   * @param {React.Component} Component
   * @param props
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

    const currentParams = navigation.state.routes[navigation.state.index].params
    if (currentParams && currentParams.backPage) {
      this.setState({ currentState: {}, stack: [] }, () => {
        navigation.navigate(currentParams.backPage, currentParams.navigationParams)
        this.trans = false
      })
      return
    }

    const nextRoute = this.state.stack.pop()
    if (nextRoute) {
      this.trans = true
      const { params: navigationParams } = nextRoute.state
      this.setState({ currentState: { ...nextRoute.state, ...params, route: nextRoute.route } }, () => {
        navigation.navigate(nextRoute.route, navigationParams)
        this.trans = false
      })
    } else if (navigation.state.index === 0) {
      this.goToParent()
    } else {
      this.goToRoot()
    }
  }

  /**
   * Push a route to the stack
   * The stack is maintained in stack property to be able to navigate back and forward
   */
  push = (nextRoute, params) => {
    const { navigation } = this.props
    const { params: navigationParams } = params || {}
    const route = navigation.state.routes[navigation.state.index].key
    this.trans = true
    this.setState(
      state => {
        return {
          stack: [
            ...state.stack,
            {
              route,
              state: state.currentState,
            },
          ],
          currentState: { ...params, route },
        }
      },
      () => {
        navigation.navigate(nextRoute, navigationParams)
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
      currentState: {},
    })

    const route = navigation.state.routes[0]
    route.params = {
      ...route.params,
      ...DEFAULT_PARAMS,
    }

    navigation.navigate(route)
    this.trans = false
  }

  /**
   * Navigates to specific screen with custom parameters as query string.
   */
  navigateTo = (nextRoute: string, params: any) => {
    const { navigation } = this.props
    const route = navigation.state.routes[navigation.state.index].key
    this.trans = true
    this.setState(
      state => {
        return {
          stack: state.stack,
          currentState: { ...params, route },
        }
      },
      () => {
        navigation.navigate(nextRoute)
        this.trans = false
      }
    )
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

  /**
   * Based on the value returned by the onChange callback sets the simpleStore sidemenu visibility value
   * @param {boolean} visible
   */
  sideMenuSwap = visible => {
    const { store } = this.props
    const sidemenu = store.get('sidemenu')

    sidemenu.visible = visible

    store.set('sidemenu')(sidemenu)
  }

  render() {
    const { descriptors, navigation, navigationConfig, screenProps: incomingScreenProps, store } = this.props
    const activeKey = navigation.state.routes[navigation.state.index].key
    const descriptor = descriptors[activeKey]
    const {
      title,
      navigationBar: NavigationBar,
      navigationBarHidden,
      backButtonHidden,
      disableScroll,
    } = descriptor.options
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
    }
    log.info('stackNavigation Render: FIXME rerender', descriptor, activeKey)
    const Component = this.getComponent(descriptor.getComponent(), { screenProps })
    const pageTitle = title || activeKey
    const open = store.get('sidemenu').visible
    const { visible: dialogVisible } = (store.get('currentScreen') || {}).dialogData || {}
    const currentFeed = store.get('currentFeed')
    const menu = (
      <SafeAreaView style={styles.safeArea}>{open ? <SideMenuPanel navigation={navigation} /> : null}</SafeAreaView>
    )

    return (
      <React.Fragment>
        <View style={[styles.sideMenuContainer, open ? styles.menuOpenStyle : styles.hideMenu]}>
          <SideMenu
            menu={menu}
            menuPosition="right"
            isOpen={open}
            disableGestures={true}
            onChange={this.sideMenuSwap}
          />
        </View>
        <Blurred style={fullScreenContainer} blur={open || dialogVisible || currentFeed}>
          {!navigationBarHidden &&
            (NavigationBar ? (
              <NavigationBar />
            ) : (
              <NavBar goBack={backButtonHidden ? undefined : this.pop} title={pageTitle} />
            ))}
          {disableScroll ? (
            <SceneView navigation={descriptor.navigation} component={Component} screenProps={screenProps} />
          ) : (
            <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollableView}>
              <SceneView navigation={descriptor.navigation} component={Component} screenProps={screenProps} />
            </ScrollView>
          )}
        </Blurred>
      </React.Fragment>
    )
  }
}

const fullScreen = {
  top: 0,
  left: 0,
  bottom: 0,
  right: 0,
  position: 'absolute',
}
const fullScreenContainer = {
  ...fullScreen,
  display: 'flex',
  flexGrow: 1,
  flexDirection: 'column',
}

const styles = StyleSheet.create({
  scrollView: {
    display: 'flex',
    flexGrow: 1,
  },
  scrollableView: {
    flexGrow: 1,
    display: 'flex',
    height: '100%',
  },
  sideMenuContainer: {
    ...fullScreen,
    transform: [
      {
        translateX: Platform.select({
          web: '200vw',
          default: getScreenWidth() * 2,
        }),
      },
    ],
    zIndex: 100,
  },
  menuOpenStyle: {
    transform: [{ translateX: 0 }],
  },
  hideMenu: {
    display: 'none',
  },
  safeArea: {
    padding: 0,
    paddingHorizontal: 0,
    paddingVertical: 0,
    flex: 1,
  },
})

/**
 * Returns a navigator with a navbar wrapping the routes.
 * This function is meant to be used to create a new stack navigation with the given routes.
 * @param {[Route]} routes: Array with routes in the stack
 * @param {Object} navigationConfig
 */
export const createStackNavigator = (routes: any, navigationConfig: any) => {
  const defaultNavigationConfig = {
    backRouteName: 'Home',
  }

  return createNavigator(SimpleStore.withStore(AppView), SwitchRouter(routes), {
    ...defaultNavigationConfig,
    ...navigationConfig,
    navigationOptions,
  })
}

type BackButtonProps = {
  ...ButtonProps,
  routeName?: Route,
  screenProps: { goToParent: () => void },
}

/**
 * BackButton
 * This button gets the goToParent action from screenProps. Is meant to be used inside a stackNavigator
 * @param {ButtonProps} props
 */
const backButton = (props: BackButtonProps) => {
  const { disabled, screenProps, children, mode, color, styles, textStyle = {} } = props

  return (
    <CustomButton
      {...props}
      compact={true}
      mode={mode || 'text'}
      color={color || '#A3A3A3'}
      disabled={disabled}
      onPress={screenProps.goToParent}
      textStyle={[styles.cancelButton, textStyle]}
    >
      {children}
    </CustomButton>
  )
}

const getStylesFromProps = ({ theme }) => ({
  cancelButton: {
    color: theme.colors.gray80Percent,
    fontSize: normalize(14),
    fontWeight: '500',
  },
})

export const BackButton = withStyles(getStylesFromProps)(backButton)

type NextButtonProps = {
  ...ButtonProps,
  values: {},
  screenProps: { push: (routeName: string, params: any) => void },
  nextRoutes: [string],
  label?: string,
  canContinue?: Function,
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
  canContinue,
  loading,
}: NextButtonProps) => {
  const [next, ...nextRoutes] = nextRoutesParam ? nextRoutesParam : []
  return (
    <PushButton
      mode="contained"
      disabled={disabled || !next}
      screenProps={{ ...screenProps }}
      params={{ ...values, nextRoutes }}
      routeName={next}
      style={Platform.OS === 'web' && { flex: 2 }}
      canContinue={canContinue}
      loading={loading}
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
  const [state, setState] = useState<any>()

  if (setScreenState) {
    return [screenState || {}, setScreenState]
  }

  return [state || {}, setState]
}
