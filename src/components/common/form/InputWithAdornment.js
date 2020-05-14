// @flow
import React, { useCallback, useEffect, useMemo } from 'react'
import { isMobile, isMobileSafari } from 'mobile-device-detect'
import { StyleSheet, TextInput, TouchableOpacity, View } from 'react-native'
import normalize from '../../../lib/utils/normalizeText'
import { useCurriedSetters } from '../../../lib/undux/SimpleStore'
import { withStyles } from '../../../lib/styles'
import Icon from '../view/Icon'
import Config from '../../../config/config'
import ErrorText from './ErrorText'

const shouldChangeSizeOnKeyboardShown = isMobileSafari && Config.safariMobileKeyboardGuidedSize

const InputText = ({
  showAdornment,
  adornment,
  adornmentAction,
  adornmentSize = 16,
  adornmentStyle,
  adornmentColor,
  error,
  styles,
  theme,
  containerStyle,
  style,
  getRef,
  onBlur,
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

  return (
    <View style={[styles.view, containerStyle]}>
      <View style={styles.view}>
        <TextInput
          {...props}
          ref={getRef}
          style={[styles.input, { borderBottomColor: inputColor, color: inputColor }, style]}
          placeholderTextColor={theme.colors.gray50Percent}
          onTouchStart={onTouchStart}
          onBlur={onBlurHandler}
        />
        {showAdornment && error !== '' && (
          <TouchableOpacity style={[styles.adornment, adornmentStyle]} onPress={adornmentAction}>
            <Icon size={normalize(adornmentSize)} color={adornmentColor || inputColor} name={adornment} />
          </TouchableOpacity>
        )}
      </View>
      <ErrorText error={error} />
    </View>
  )
}

const getStylesFromProps = ({ theme }) => ({
  input: {
    ...theme.fontStyle,
    backgroundColor: theme.colors.surface,
    borderBottomColor: theme.colors.darkGray,
    borderBottomStyle: 'solid',
    borderBottomWidth: StyleSheet.hairlineWidth,
    color: theme.colors.darkGray,
    fontFamily: theme.fonts.slab,
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
})

export default withStyles(getStylesFromProps)(InputText)
