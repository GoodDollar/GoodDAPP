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
  class WrappedComponent extends React.Component {
    _root

    /**
     * @internal
     * Required for when the component is wrapped inside a TouchableOpacity* element
     * https://facebook.github.io/react-native/docs/direct-manipulation
     */
    setNativeProps(...args) {
      return this._root && this._root.setNativeProps(...args)
    }

    render() {
      if (!isFunction(mapThemeToStyles)) {
        return <Component ref={c => (this._root = c)} {...this.props} />
      }

      const stylesObject = mapThemeToStyles(this.props)
      const styles = withStyleSheet ? StyleSheet.create(stylesObject) : stylesObject

      return <Component ref={c => (this._root = c)} {...this.props} styles={styles} />
    }
  }
  return withTheme(WrappedComponent)
}
