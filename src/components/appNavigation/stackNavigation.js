// @flow
import React, { Component, useEffect, useState } from 'react'
import { Platform, SafeAreaView, ScrollView, StyleSheet, View } from 'react-native'
import SideMenu from '@gooddollar/react-native-side-menu'
import { createNavigator, Route, SceneView, SwitchRouter } from '@react-navigation/core'
import { isEqualWith, isFunction, isNumber } from 'lodash'

import { withStyles } from '../../lib/styles'
import { getScreenWidth } from '../../lib/utils/orientation'
import { isWeb } from '../../lib/utils/platform'
import SimpleStore from '../../lib/undux/SimpleStore'
import normalize from '../../lib/utils/normalizeText'
import SideMenuPanel from '../sidemenu/SideMenuPanel'
import logger from '../../lib/logger/pino-logger'
import CustomButton, { type ButtonProps } from '../common/buttons/CustomButton'
import Blurred from '../common/view/Blurred'
import BackButtonHandler from '../../lib/utils/handleBackButton'
import { GlobalTogglesContext } from '../../lib/contexts/togglesContext'
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

  shouldComponentUpdate(nextProps, nextState) {
    if (this.trans) {
      return false
    }
    const navStateChanged =
      isEqualWith(nextProps, this.props, (val1, val2) => (isFunction(val1) && isFunction(val2) ? true : undefined)) ===
      false
    const stateChanged = isEqualWith(nextState, this.state) === false

    return navStateChanged || stateChanged
  }

  /**
   * handler for back Button on Android
   */
  backButtonHandler = null

  componentDidMount() {
    const { toggleClickListener } = this

    this.backButtonHandler = new BackButtonHandler({ defaultAction: this.pop })
    toggleClickListener('add')
  }

  componentWillUnmount() {
    const { toggleClickListener } = this

    toggleClickListener('remove')
    this.backButtonHandler.unregister()
  }

  toggleClickListener = eventAction => {
    if (!isWeb) {
      return
    }

    document[eventAction + 'EventListener']('mousedown', this.handleClickOutside)
  }

  handleClickOutside = event => {
    const { setMenu, isMenuOpened } = this

    if (isWeb && isMenuOpened && event.target === document.documentElement) {
      setMenu(false)
    }
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
        this.trans = false
        navigation.navigate(currentParams.backPage, currentParams.navigationParams)
      })
      return
    }

    const nextRoute = this.state.stack.pop()
    if (nextRoute) {
      this.trans = true
      const navigationParams = nextRoute.state
      this.setState({ currentState: { ...navigationParams, ...params, route: nextRoute.route } }, () => {
        this.trans = false
        navigation.navigate(nextRoute.route, navigationParams)
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
    const navigationParams = params || {}
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
      state => {
        this.trans = false
        navigation.navigate(nextRoute, { ...navigationParams, route })
      },
    )
  }

  /**
   * Navigates to root screen. First on stack
   */
  goToRoot = () => {
    const { navigation } = this.props
    this.trans = true
    this.setState(
      {
        stack: [],
        currentState: {},
      },
      () => {},
    )
    const route = navigation.state.routes[0]
    route.params = {
      ...route.params,
      ...DEFAULT_PARAMS,
    }
    this.trans = false

    //NOTICE: for some reason this doesnt work when inside setState callback only in gotoRoot
    //and when called from a page like SendLinkSummary when opening a payment request, ie not opening dashboard first
    //not sure that we need to keep stack as state variable at all

    navigation.navigate(route)
  }

  /**
   * Navigates to specific screen with custom parameters as query string. and resetting the stack
   */
  navigateTo = (nextRoute: string, params: any) => {
    const { navigation } = this.props
    const route = navigation.state.routes[navigation.state.index].key
    this.trans = true
    this.setState(
      state => {
        return {
          stack: [],
          currentState: { ...params, route },
        }
      },
      () => {
        navigation.navigate(nextRoute)
        this.trans = false
      },
    )
  }

  /**
   * Navigates to the screen that created the stack (backRouteName)
   */
  goToParent = () => {
    const { navigation, navigationConfig } = this.props

    if (navigationConfig.backRouteName) {
      this.trans = true
      this.setState({ currentState: {}, stack: [] }, () => {
        navigation.navigate(navigationConfig.backRouteName)
        this.trans = false
      })
    }
  }

  /**
   * Screen states are being stored by this component
   * This way it can be kept between screens
   */
  setScreenState = data => {
    this.setState(state => ({ currentState: { ...state.currentState, ...data } }))
  }

  // /**
  //  * Based on the value returned by the onChange callback sets the simpleStore sidemenu visibility value
  //  * @param {boolean} visible
  //  */
  // sideMenuSwap = visible => {
  //   const { store } = this.props

  //   store.set('sidemenu')({
  //     ...(store.get('sidemenu') || {}),
  //     visible,
  //   })
  // }

  // isMenuOpened = () => {
  //   const { store } = this.props

  //   if (!store) {
  //     return false
  //   }

  //   return store.get('sidemenu').visible
  // }

  render() {
    const { isMenuOn, setMenu } = this.context
    this.setMenu = setMenu
    this.isMenuOpened = isMenuOn
    const { descriptors, navigation, navigationConfig, screenProps: incomingScreenProps } = this.props
    const activeKey = navigation.state.routes[navigation.state.index].key
    const descriptor = descriptors[activeKey]

    const {
      title,
      navigationBar: NavigationBar,
      navigationBarHidden,
      backButtonHidden,
      disableScroll,
      backToWallet = false,
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

    log.info('stackNavigation Render: FIXME rerender', descriptor, activeKey, isMenuOn)

    const Component = this.getComponent(descriptor.getComponent(), { screenProps })
    const pageTitle = title || activeKey

    return (
      <React.Fragment>
        {isMenuOn && (
          <View style={[styles.sideMenuContainer, styles.menuOpenStyle]} ref={this.wrapperRef}>
            <SideMenu
              menuPosition="right"
              isOpen={true}
              disableGestures={true}
              onChange={this.setMenu}
              menu={
                <SafeAreaView style={styles.safeArea}>
                  <SideMenuPanel navigation={navigation} />
                </SafeAreaView>
              }
            />
          </View>
        )}
        <Blurred ref={this.blurRef} whenSideMenu>
          {!navigationBarHidden &&
            (NavigationBar ? (
              <NavigationBar />
            ) : (
              <NavBar backToWallet={backToWallet} goBack={backButtonHidden ? undefined : this.pop} title={pageTitle} />
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

AppView.contextType = GlobalTogglesContext

const styles = StyleSheet.create({
  scrollView: {
    display: 'flex',

    // flexGrow: 1,
  },
  scrollableView: {
    flexGrow: 1,
    display: 'flex',

    // height: '100%',
  },
  sideMenuContainer: {
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    position: 'absolute',
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

const traverseRoutes = (navState, onLeaf) => {
  const { index, routes } = navState
  let segment = routes[index]

  for (;;) {
    const { index, routes } = segment

    onLeaf(segment)

    if (!isNumber(index)) {
      break
    }

    segment = routes[index]
  }
}

export const getRoutePath = navState => {
  let path = ''

  traverseRoutes(navState, ({ key }) => (path += '/' + key))
  return path
}

export const getRouteName = navState => {
  let name = ''

  traverseRoutes(navState, ({ routeName }) => (name = routeName))
  return name
}
