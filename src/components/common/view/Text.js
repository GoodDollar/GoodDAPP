// @flow
import React from 'react'
import { Text as PaperText } from 'react-native-paper'
import normalize from '../../../lib/utils/normalizeText'
import { withStyles } from '../../../lib/styles'

const LINE_HEIGHT_FACTOR = 1.2

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
      styles,
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

    return <PaperText {...rest} ref={c => (this._root = c)} style={[styles.text, style]} />
  }
}

/**
 * Returns the linespacing associated to the font-size based on guidelines
 * Defaults to 1em if size is not in the list
 * @param {number} fontSize - defaults to 16
 * @returns {*|string}
 */
const relatedLineSpacing = (fontSize = 16) =>
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
    42: normalize(30),
  }[fontSize] || normalize(fontSize * LINE_HEIGHT_FACTOR))

/**
 * Returns the proper value to apply for the fontWeight prop based on values provided in wireframes
 * @param {string} fontWeight - defaults to 'regular' { regular: 'normal', medium: '500', bold: '700' }
 * @returns {string}
 */
const calculateFontWeight = (fontWeight = 'regular') =>
  ({
    regular: 'normal',
    medium: '500',
    bold: '700',
  }[fontWeight] || 'normal')

const getStylesFromProps = ({
  theme,
  color,
  textAlign,
  fontWeight,
  fontFamily,
  fontSize,
  lineHeight,
  textDecorationLine,
  textTransform,
}) => {
  const calculatedFontSize = Number.isFinite(fontSize) ? normalize(fontSize) : normalize(16)
  const calculatedLineHeight = Number.isFinite(lineHeight) ? normalize(lineHeight) : relatedLineSpacing(fontSize)
  const calculatedFontWeight = Number.isFinite(fontWeight) ? fontWeight : calculateFontWeight(fontWeight)

  return {
    text: {
      color: theme.colors[color] || color || theme.colors.text,
      textAlign: textAlign || 'center',
      fontWeight: calculatedFontWeight,
      fontFamily: theme.fonts[fontFamily] || fontFamily || 'Roboto',
      fontSize: calculatedFontSize,
      lineHeight: calculatedLineHeight,
      textTransform: textTransform || 'none',
      textDecorationLine: textDecorationLine || 'none',
    },
  }
}

export default withStyles(getStylesFromProps)(Text)
