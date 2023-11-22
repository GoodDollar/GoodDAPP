// @flow
import React, { useCallback, useContext, useEffect, useMemo } from 'react'
import { StyleSheet, TextInput, TouchableOpacity, View } from 'react-native'
import { noop } from 'lodash'

import { isMobileWeb as isMobile, isMobileSafari } from '../../../lib/utils/platform'
import normalize from '../../../lib/utils/normalizeText'
import { GlobalTogglesContext } from '../../../lib/contexts/togglesContext'
import { withStyles } from '../../../lib/styles'
import { calculateFontFamily, calculateFontWeight } from '../../../lib/utils/fonts'
import Icon from '../view/Icon'
import Config from '../../../config/config'
import useOnPress from '../../../lib/hooks/useOnPress'
import ErrorText from './ErrorText'

const shouldChangeSizeOnKeyboardShown = isMobileSafari && Config.safariMobileKeyboardGuidedSize

/**
 * default of icon placement is on the right side
 *
 */
const InputTextWAddons = ({
  showAdornment,
  showError = true,
  error,
  styles,
  theme,
  containerStyle,
  style,
  getRef,
  onBlur,
  placeholderTextColor,

  prefixIcon = false,
  prefixDisabled = false,
  prefixColor,
  prefixStyle,
  prefixIconSize,
  onPrefixClick = noop,

  suffixIcon = false,
  suffixDisabled = false,
  suffixColor,
  suffixStyle,
  suffixIconSize,
  onSuffixClick = noop,
  ...props
}) => {
  const { setMobileSafariKeyboardShown, setMobileKeyboardShown } = useContext(GlobalTogglesContext)

  const onTouchStart = useCallback(() => {
    if (shouldChangeSizeOnKeyboardShown) {
      window.scrollTo(0, 0)
      document.body.scrollTop = 0
      setMobileSafariKeyboardShown(true)
    }

    if (isMobile) {
      setMobileKeyboardShown(true)
    }
  }, [setMobileSafariKeyboardShown, setMobileKeyboardShown])

  const onBlurHandler = useCallback(() => {
    if (shouldChangeSizeOnKeyboardShown) {
      setMobileSafariKeyboardShown(false)
    }

    if (isMobile) {
      setMobileKeyboardShown(false)
    }

    if (onBlur) {
      onBlur()
    }
  }, [setMobileSafariKeyboardShown, setMobileKeyboardShown, onBlur])

  useEffect(() => {
    setMobileSafariKeyboardShown(false)
    setMobileKeyboardShown(false)
  }, [])

  const inputColor = useMemo(() => {
    const { red, lightBlue } = theme.colors

    return error ? red : lightBlue
  }, [error])

  const _onPressPrefix = useOnPress(onPrefixClick)
  const _onPressSuffix = useOnPress(onSuffixClick)

  return (
    <View style={[styles.view, containerStyle]}>
      <View style={styles.view}>
        {prefixIcon && (
          <TouchableOpacity style={[styles.adornment, prefixStyle]} disabled={prefixDisabled} onPress={_onPressPrefix}>
            <Icon size={normalize(prefixIconSize)} color={prefixColor || inputColor} name={prefixIcon} />
          </TouchableOpacity>
        )}
        <TextInput
          {...props}
          ref={getRef}
          style={[styles.input, { borderBottomColor: error ? 'red' : inputColor, color: inputColor }, style]}
          placeholderTextColor={placeholderTextColor || theme.colors.gray50Percent}
          onTouchStart={onTouchStart}
          onBlur={onBlurHandler}
        />
        {suffixIcon && (
          <TouchableOpacity style={[styles.adornment, suffixStyle]} disabled={suffixDisabled} onPress={_onPressSuffix}>
            <Icon size={normalize(suffixIconSize)} color={suffixColor || inputColor} name={suffixIcon} />
          </TouchableOpacity>
        )}
      </View>
      {showError && <ErrorText error={error} />}
    </View>
  )
}

const getStylesFromProps = ({ theme, fontFamily, fontWeight, style }) => {
  const selectedFontFamily = fontFamily || theme.fonts.slab
  const selectedFontWeight = StyleSheet.flatten(style)?.fontWeight || fontWeight

  const calculatedFontWeight = isNaN(selectedFontWeight) ? calculateFontWeight(selectedFontWeight) : selectedFontWeight
  const calculatedFontFamily = calculateFontFamily(selectedFontFamily, selectedFontWeight)

  return {
    input: {
      ...theme.fontStyle,
      fontWeight: calculatedFontWeight,
      backgroundColor: theme.colors.surface,
      borderBottomColor: theme.colors.lightBlue,
      borderBottomWidth: StyleSheet.hairlineWidth,
      color: theme.colors.lightBlue,
      fontFamily: calculatedFontFamily,
      paddingHorizontal: theme.sizes.defaultQuadruple,
      paddingVertical: theme.sizes.defaultHalf,
    },
    view: {
      width: '100%',
      marginBottom: theme.sizes.default,
    },
    adornment: {
      paddingTop: theme.paddings.mainContainerPadding,
      position: 'absolute',
      right: theme.sizes.default,
      zIndex: 1,
      bottom: 10,
    },
  }
}

export default withStyles(getStylesFromProps)(InputTextWAddons)
