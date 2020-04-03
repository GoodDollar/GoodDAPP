// @flow
import React, { useCallback, useEffect } from 'react'
import { isMobile, isMobileSafari } from 'mobile-device-detect'
import { StyleSheet, TextInput, TouchableOpacity, View } from 'react-native'
import normalize from '../../../lib/utils/normalizeText'
import SimpleStore from '../../../lib/undux/SimpleStore'
import { withStyles } from '../../../lib/styles'
import Icon from '../view/Icon'
import Config from '../../../config/config'
import ErrorText from './ErrorText'

const InputText = ({
  showAdornment,
  adornment,
  adornmentAction,
  adornmentSize = 16,
  adornmentStyle,
  error,
  styles,
  theme,
  style,
  getRef,
  ...props
}) => {
  const simpleStore = SimpleStore.useStore()
  const shouldChangeSizeOnKeyboardShown = isMobileSafari && simpleStore.set && Config.safariMobileKeyboardGuidedSize

  const onTouchStart = useCallback(() => {
    if (shouldChangeSizeOnKeyboardShown) {
      window.scrollTo(0, 0)
      document.body.scrollTop = 0
      simpleStore.set('isMobileSafariKeyboardShown')(true)
    }

    if (isMobile) {
      simpleStore.set('isMobileKeyboardShown')(true)
    }
  }, [simpleStore])

  const onBlur = useCallback(() => {
    if (shouldChangeSizeOnKeyboardShown) {
      simpleStore.set('isMobileSafariKeyboardShown')(false)
    }

    if (isMobile) {
      simpleStore.set('isMobileKeyboardShown')(false)
    }

    if (props.onBlur) {
      props.onBlur()
    }
  }, [simpleStore, props])

  useEffect(() => {
    simpleStore.set('isMobileSafariKeyboardShown')(false)
    simpleStore.set('isMobileKeyboardShown')(false)
  }, [])

  const inputColor = error ? theme.colors.red : theme.colors.darkGray
  const inputStyle = {
    borderBottomColor: inputColor,
    color: inputColor,
  }

  return (
    <View style={styles.view}>
      <View style={styles.view}>
        <TextInput
          {...props}
          ref={getRef}
          style={[styles.input, inputStyle, style]}
          placeholderTextColor={theme.colors.gray50Percent}
          onTouchStart={onTouchStart}
          onBlur={onBlur}
        />
        {showAdornment && error !== '' && (
          <TouchableOpacity style={[styles.adornment, adornmentStyle]} onPress={adornmentAction}>
            <Icon size={normalize(adornmentSize)} color={inputColor} name={adornment} />
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
    flex: 1,
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
