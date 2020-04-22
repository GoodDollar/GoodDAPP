// @flow
import React, { useEffect } from 'react'
import { StyleSheet, TextInput, TouchableOpacity, View } from 'react-native'
import normalize from '../../../lib/utils/normalizeText'
import { isMobile, isMobileSafari } from '../../../lib/utils/platform'
import SimpleStore from '../../../lib/undux/SimpleStore'
import { withStyles } from '../../../lib/styles'
import Icon from '../view/Icon'
import Config from '../../../config/config'
import ErrorText from './ErrorText'

const InputText = ({ error, onCleanUpField, styles, theme, style, getRef, ...props }: any) => {
  const simpleStore = SimpleStore.useStore()

  const shouldChangeSizeOnKeyboardShown = isMobileSafari && simpleStore.set && Config.safariMobileKeyboardGuidedSize

  const onFocus = () => {
    if (shouldChangeSizeOnKeyboardShown) {
      window.scrollTo(0, 0)
      document.body.scrollTop = 0
      simpleStore.set('isMobileSafariKeyboardShown')(true)
    }
    if (isMobile) {
      simpleStore.set('isMobileKeyboardShown')(true)
    }
  }

  const onBlur = () => {
    if (shouldChangeSizeOnKeyboardShown) {
      simpleStore.set('isMobileSafariKeyboardShown')(false)
    }
    if (isMobile) {
      simpleStore.set('isMobileKeyboardShown')(false)
    }
  }

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
          onFocus={() => {
            if (props.onFocus) {
              props.onFocus()
            }
          }}
          onTouchStart={onFocus}
          onBlur={() => {
            onBlur()
            if (props.onBlur) {
              props.onBlur()
            }
          }}
        />
        {onCleanUpField && error !== '' && (
          <TouchableOpacity style={styles.suffixIcon} onPress={() => onCleanUpField('')}>
            <Icon size={normalize(16)} color={inputColor} name="close" />
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
    borderStyle: 'solid',
    borderBottomWidth: StyleSheet.hairlineWidth,
    color: theme.colors.darkGray,
    fontFamily: theme.fonts.slab,
    paddingHorizontal: theme.sizes.defaultQuadruple,
    paddingVertical: theme.sizes.defaultHalf,
    width: '100%',
  },
  view: {
    marginBottom: theme.sizes.default,
    width: '100%',
  },
  suffixIcon: {
    paddingTop: theme.paddings.mainContainerPadding,
    position: 'absolute',
    right: theme.sizes.default,
    zIndex: 1,
  },
})

export default withStyles(getStylesFromProps)(InputText)
