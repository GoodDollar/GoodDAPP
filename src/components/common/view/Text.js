// @flow
import React from 'react'
import { normalize } from 'react-native-elements'
import { Text as PaperText, withTheme } from 'react-native-paper'

class Text extends React.Component {
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
    const { style, theme, ...rest } = this.props

    return <PaperText {...rest} ref={c => (this._root = c)} style={[getStylesFromProps(this.props), style]} />
  }
}

const getStylesFromProps = props => {
  const { theme, color, align, weight, family, transform, size, decoration } = props

  return {
    color: theme.colors[color] || color || theme.colors.text,
    textAlign: align || 'center',
    fontWeight: weight || 'normal',
    fontFamily: theme.fonts[family] || family || 'Roboto',
    fontSize: Number.isFinite(size) ? normalize(size) : normalize(16),
    textTransform: transform || 'none',
    textDecorationStyle: decoration || 'none'
  }
}

export default withTheme(Text)
