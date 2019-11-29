/**
 * @param route (navigation.state)
 * @returns {string} Current deep child route name
 */
export const getCurrentKey = route => {
  if (route.index !== undefined && route.routes && route.routes.length > 0) {
    return getCurrentKey(route.routes[route.index])
  }
  return route.key.toLowerCase()
}
