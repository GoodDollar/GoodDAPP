import { assign, isArray } from 'lodash'
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
  const screens = isArray(screen) ? screen : [screen]

  screens.forEach(screen => assign(screen, { navigationOptions }))
  return screen
}
