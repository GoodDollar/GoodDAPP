import { assign, forIn, isArray, isPlainObject } from 'lodash'
import { suspenseWithIndicator } from '../../components/common/view/LoadingIndicator'
import { lazyExport } from './async'

export const getRouteParams = (navigation, pathName, params) => {
  let parentNavigator
  let selectedNavigator = navigation

  // traverse nested navigators
  while ((parentNavigator = selectedNavigator.dangerouslyGetParent())) {
    selectedNavigator = parentNavigator
  }

  const root = selectedNavigator.router.getActionForPathAndParams(pathName) || {}
  let routeParams = root

  // traverse nested routes
  while (routeParams && routeParams.action) {
    routeParams = routeParams.action
  }

  return {
    ...routeParams,
    params: {
      ...routeParams.params,
      ...params,
    },
  }
}

export const lazyScreens = (dynamicImport, ...components) =>
  lazyExport(dynamicImport, suspenseWithIndicator, ...components)

export const withNavigationOptions = navigationOptions => screen => {
  const addOptions = screen => assign(screen, { navigationOptions })

  if (isPlainObject(screen)) {
    forIn(screen, addOptions)
  } else {
    const screens = isArray(screen) ? screen : [screen]

    screens.forEach(addOptions)
  }

  return screen
}
