// @flow
import React from 'react'
import { StyleSheet } from 'react-native'
import { Text as PaperText } from 'react-native-paper'

import normalize from '../../../lib/utils/normalizeText'
import { withStyles } from '../../../lib/styles'
import { calculateFontFamily, calculateFontWeight } from '../../../lib/utils/fonts'

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
 * @param {number} fontSize
 * @returns {*|string}
 */
const relatedLineSpacing = fontSize =>
  ({
    8: 14,
    10: 14,
    12: 16,
    14: 20,
    16: 22,
    18: 24,
    22: 30,
    24: 30,
    36: 30,
    42: 30,
  }[fontSize] || fontSize * LINE_HEIGHT_FACTOR)

const getStylesFromProps = ({
  theme,
  color,
  textAlign,
  style,
  fontWeight,
  fontFamily,
  fontSize,
  lineHeight,
  textDecorationLine,
  textTransform,
  letterSpacing,
  normalizeText = true,
}) => {
  const calculatedFontSize = Number.isFinite(fontSize) ? fontSize : 16
  const calculatedLineHeight = lineHeight || relatedLineSpacing(calculatedFontSize)

  const selectedFontFamily = theme.fonts[fontFamily] || fontFamily
  const selectedFontWeight = StyleSheet.flatten(style)?.fontWeight || fontWeight

  const calculatedFontWeight = isNaN(selectedFontWeight) ? calculateFontWeight(selectedFontWeight) : selectedFontWeight
  const calculatedFontFamily = calculateFontFamily(selectedFontFamily, selectedFontWeight)

  return {
    text: {
      color: theme.colors[color] || color || theme.colors.darkGray,
      textAlign: textAlign || 'center',
      fontWeight: calculatedFontWeight,
      fontFamily: calculatedFontFamily,
      fontSize: normalizeText ? normalize(calculatedFontSize) : calculatedFontSize,
      lineHeight: normalizeText ? normalize(calculatedLineHeight) : calculatedLineHeight,
      textTransform: textTransform || 'none',
      textDecorationLine: textDecorationLine || 'none',
      letterSpacing,
    },
  }
}

export default withStyles(getStylesFromProps)(Text)
