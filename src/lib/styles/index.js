import React from 'react'
import { withTheme } from 'react-native-paper'
import { StyleSheet } from 'react-native'

function isFunction(functionToCheck) {
  return functionToCheck && {}.toString.call(functionToCheck) === '[object Function]'
}

/**
 * HOC that injects `theme` from `withTheme` and `styles` using theme values into the `Component`
 * @param {*} mapThemeToStyles receives props and retuns an object with calculated styles
 * @param {*} withStyleSheet wheather should or shouldn't be the result wrapped with `StyleSheet.create`
 */
export const withStyles = (mapThemeToStyles, withStyleSheet = true) => Component => {
  return props => {
    const WrappedComponent = withTheme(Component)

    if (!isFunction(mapThemeToStyles)) {
      return <WrappedComponent {...props} />
    }

    const stylesObject = mapThemeToStyles(props)
    const styles = withStyleSheet ? StyleSheet.create(stylesObject) : stylesObject

    return <WrappedComponent {...props} styles={styles} />
  }
}
