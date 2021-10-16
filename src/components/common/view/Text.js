// @flow
import React from 'react'
import { StyleSheet } from 'react-native'
import { Text as PaperText } from 'react-native-paper'
import _ from 'lodash'

import normalize from '../../../lib/utils/normalizeText'
import { withStyles } from '../../../lib/styles'
import { isAndroidNative, isMobileNative } from '../../../lib/utils/platform'

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

/**
 * Returns the proper value to apply for the fontWeight prop based on values provided in wireframes
 * @param {string} fontWeight - defaults to 'regular'
 * {
 *   extralight: 100,
 *   thin: 200,
 *   book: 300,
 *   regular: 400,
 *   medium: 500,
 *   semibold: 600,
 *   bold: 700,
 *   black: 800,
 *   fat: 900
 * }
 * @returns {string}
 */

const FONT_WEIGHT_VALUE_PAIRS = {
  extralight: '100',
  thin: '200',
  book: '300',
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
  black: '800',
  fat: '900',
}

const calculateFontWeight = (fontWeight = 'regular') =>
  ({ ...FONT_WEIGHT_VALUE_PAIRS, regular: 'normal' }[fontWeight] || 'normal')

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
  const calculatedFontWeight = isNaN(fontWeight) ? calculateFontWeight(fontWeight) : fontWeight
  const calculatedInvertedFontWeight = selectedFontWeight =>
    isNaN(selectedFontWeight) ? selectedFontWeight : _.invert(FONT_WEIGHT_VALUE_PAIRS)[selectedFontWeight]

  const calculatedFontFamily =
    theme.fonts[fontFamily] ||
    fontFamily ||
    (fontWeight && isMobileNative && `Roboto-${_.capitalize(fontWeight)}`) ||
    'Roboto'

  const calculatedFontFamilyAndroid = fontFamily
    ? `${theme.fonts[fontFamily] || fontFamily}-${_.capitalize(
        calculatedInvertedFontWeight(StyleSheet.flatten(style)?.fontWeight || fontWeight),
      ) || 'Regular'}`
    : `Roboto-${_.capitalize(calculatedInvertedFontWeight(StyleSheet.flatten(style)?.fontWeight || fontWeight)) ||
        'Regular'}`

  return {
    text: {
      color: theme.colors[color] || color || theme.colors.darkGray,
      textAlign: textAlign || 'center',
      fontWeight: calculatedFontWeight,
      fontFamily: isAndroidNative ? calculatedFontFamilyAndroid : calculatedFontFamily,
      fontSize: normalizeText ? normalize(calculatedFontSize) : calculatedFontSize,
      lineHeight: normalizeText ? normalize(calculatedLineHeight) : calculatedLineHeight,
      textTransform: textTransform || 'none',
      textDecorationLine: textDecorationLine || 'none',
      letterSpacing,
    },
  }
}

export default withStyles(getStylesFromProps)(Text)
