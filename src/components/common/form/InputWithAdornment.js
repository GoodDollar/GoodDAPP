// @flow
import React, { useCallback, useEffect, useMemo } from 'react'
import { StyleSheet, TextInput, TouchableOpacity, View } from 'react-native'
import { isMobileWeb as isMobile, isMobileSafari } from '../../../lib/utils/platform'
import normalize from '../../../lib/utils/normalizeText'
import { useCurriedSetters } from '../../../lib/undux/SimpleStore'
import { withStyles } from '../../../lib/styles'
import { calculateFontFamily, calculateFontWeight } from '../../../lib/utils/fonts'
import Icon from '../view/Icon'
import Config from '../../../config/config'
import useOnPress from '../../../lib/hooks/useOnPress'
import ErrorText from './ErrorText'

const shouldChangeSizeOnKeyboardShown = isMobileSafari && Config.safariMobileKeyboardGuidedSize

const InputText = ({
  showAdornment,
  adornment,
  adornmentAction,
  adornmentSize = 16,
  adornmentStyle,
  adornmentColor,
  adornmentDisabled = false,
  showError = true,
  error,
  styles,
  theme,
  containerStyle,
  style,
  getRef,
  onBlur,
  placeholderTextColor,
  ...props
}) => {
  const [setMobileSafariKeyboardShown, setMobileKeyboardShown] = useCurriedSetters([
    'isMobileSafariKeyboardShown',
    'isMobileKeyboardShown',
  ])

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
    const { red, darkGray } = theme.colors

    return error ? red : darkGray
  }, [error])

  const _onPress = useOnPress(adornmentAction)

  return (
    <View style={[styles.view, containerStyle]}>
      <View style={styles.view}>
        <TextInput
          {...props}
          ref={getRef}
          style={[styles.input, { borderBottomColor: inputColor, color: inputColor }, style]}
          placeholderTextColor={placeholderTextColor || theme.colors.gray50Percent}
          onTouchStart={onTouchStart}
          onBlur={onBlurHandler}
        />
        {showAdornment && error !== '' && (
          <TouchableOpacity style={[styles.adornment, adornmentStyle]} disabled={adornmentDisabled} onPress={_onPress}>
            <Icon size={normalize(adornmentSize)} color={adornmentColor || inputColor} name={adornment} />
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
      borderBottomColor: theme.colors.darkGray,
      borderBottomWidth: StyleSheet.hairlineWidth,
      color: theme.colors.darkGray,
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

export default withStyles(getStylesFromProps)(InputText)
