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
    const {
      style,
      theme,
      color,
      textAlign,
      fontWeight,
      fontFamily,
      fontSize,
      lineHeight,
      textDecorationLine,
      textTransform,
      ...rest
    } = this.props

    return <PaperText {...rest} ref={c => (this._root = c)} style={[getStylesFromProps(this.props), style]} />
  }
}

/**
 * Returns the linespacing associated to the font-size based on guidelines
 * Defaults to 1em if size is not in the list
 * @param {number} fontSize
 * @returns {*|string}
 */
const relatedLineSpacing = fontSize =>
  ({
    8: normalize(14),
    10: normalize(14),
    12: normalize(16),
    14: normalize(20),
    16: normalize(22),
    18: normalize(24),
    22: normalize(30),
    24: normalize(30),
    36: normalize(30),
    42: normalize(30)
  }[fontSize] || '1em')

const getStylesFromProps = ({
  theme,
  color,
  textAlign,
  fontWeight,
  fontFamily,
  fontSize,
  lineHeight,
  textDecorationLine,
  textTransform
}) => {
  const calculatedFontSize = Number.isFinite(fontSize) ? normalize(fontSize) : normalize(16)
  const calculatedLineHeight = lineHeight || relatedLineSpacing(calculatedFontSize)

  return {
    color: theme.colors[color] || color || theme.colors.text,
    textAlign: textAlign || 'center',
    fontWeight: fontWeight || 'normal',
    fontFamily: theme.fonts[fontFamily] || fontFamily || 'Roboto',
    fontSize: calculatedFontSize,
    lineHeight: calculatedLineHeight,
    textTransform: textTransform || 'none',
    textDecorationLine: textDecorationLine || 'none'
  }
}

export default withTheme(Text)
