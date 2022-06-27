import React from 'react'
import { useTheme, withTheme } from 'react-native-paper'
import { StyleSheet } from 'react-native'

import { isFunction } from 'lodash'

export const withOpacity = (color, opacity) => {
  let decimal = opacity

  if (!Number.isInteger(opacity) && opacity <= 1) {
    decimal = Math.round(255 * opacity)
  }

  return `${color}${decimal.toString(16)}`
}

/**
 * HOC that injects `theme` from `withTheme` and `styles` using theme values into the `Component`
 * @param {*} mapThemeToStyles receives props and retuns an object with calculated styles
 * @param {*} withStyleSheet wheather should or shouldn't be the result wrapped with `StyleSheet.create`
 */
export const withStyles = (mapThemeToStyles, withStyleSheet = true) => Component => {
  const getUpdatedStyles = props => {
    let styles = {}
    if (isFunction(mapThemeToStyles)) {
      const stylesObject = mapThemeToStyles(props)
      styles = withStyleSheet ? StyleSheet.create(stylesObject) : stylesObject
    }
    return styles
  }

  class WrappedComponent extends React.Component {
    constructor(props) {
      super(props)
      const styles = getUpdatedStyles(props)
      this.state = { styles }
    }

    static getDerivedStateFromProps(props, state) {
      const styles = getUpdatedStyles(props)
      return { styles }
    }

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

      return <Component {...this.props} styles={this.state.styles} />
    }
  }

  // Adding static methods to new wrapped component
  Object.getOwnPropertyNames(Component)
    .filter(prop => isFunction(Component[prop]))
    .forEach(staticMethod => (WrappedComponent[staticMethod] = Component[staticMethod]))
  WrappedComponent.navigationOptions = Component.navigationOptions

  return withTheme(WrappedComponent)
}

export const makeStyles = (mapThemeToStyles, withStyleSheet = true) => {
  const getUpdatedStyles = props => {
    let styles = {}

    if (isFunction(mapThemeToStyles)) {
      const stylesObject = mapThemeToStyles(props)

      styles = withStyleSheet ? StyleSheet.create(stylesObject) : stylesObject
    }

    return styles
  }

  const useStyles = props => {
    const theme = useTheme()

    return { theme, styles: getUpdatedStyles({ ...props, theme }) }
  }

  return useStyles
}
