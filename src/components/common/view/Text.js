// @flow
import React from 'react'
import { Text as PaperText } from 'react-native-paper'
import normalize from '../../../lib/utils/normalizeText'
import { withStyles } from '../../../lib/styles'

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
  textTransform,
}) => {
  const calculatedFontSize = Number.isFinite(fontSize) ? normalize(fontSize) : normalize(16)
  const calculatedLineHeight = lineHeight || relatedLineSpacing(calculatedFontSize)

  return {
    text: {
      color: theme.colors[color] || color || theme.colors.text,
      textAlign: textAlign || 'center',
      fontWeight: fontWeight || '500',
      fontFamily: theme.fonts[fontFamily] || fontFamily || 'Roboto',
      fontSize: calculatedFontSize,
      lineHeight: calculatedLineHeight,
      textTransform: textTransform || 'none',
      textDecorationLine: textDecorationLine || 'none',
    },
  }
}

export default withStyles(getStylesFromProps)(Text)
