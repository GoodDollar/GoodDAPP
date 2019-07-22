// @flow
import React from 'react'
import { StyleSheet, TextInput, TouchableOpacity, View } from 'react-native'
import HelperText from 'react-native-paper/src/components/HelperText'
import normalize from 'react-native-elements/src/helpers/normalizeText'
import Icon from '../view/Icon'
import { withStyles } from '../../../lib/styles'

const InputText = ({ error, onCleanUpField, styles, theme, style, ...props }: any) => {
  const inputColor = error ? theme.colors.red : theme.colors.darkGray
  const inputStyle = {
    color: inputColor,
    borderBottomColor: inputColor,
  }
  return (
    <View style={styles.view}>
      <View style={styles.view}>
        <TextInput {...props} style={[styles.input, inputStyle, style]} />
        {onCleanUpField && (
          <TouchableOpacity style={styles.suffixIcon} onPress={() => onCleanUpField('')}>
            <Icon size={normalize(16)} color={inputColor} name="close" />
          </TouchableOpacity>
        )}
      </View>
      <ErrorText error={error} />
    </View>
  )
}

const ErrorComponent = ({ error, styles }) => (
  <HelperText type="error" style={[styles.error, { opacity: error ? 1 : 0 }]}>
    {error}
  </HelperText>
)

const getStylesFromProps = ({ theme }) => ({
  input: {
    ...theme.fontStyle,
    fontFamily: theme.fonts.slab,
    color: theme.colors.darkGray,
    borderBottomStyle: 'solid',
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingVertical: theme.sizes.defaultHalf,
    paddingHorizontal: theme.sizes.defaultQuadruple,
    borderBottomColor: theme.colors.darkGray,
  },
  view: {
    flex: 1,
  },
  suffixIcon: {
    position: 'absolute',
    right: theme.sizes.default,
    paddingTop: theme.paddings.mainContainerPadding,
    zIndex: 1,
  },
})

const getErrorStylesFromProps = ({ theme }) => ({
  error: {
    paddingLeft: 0,
    textAlign: 'center',
  },
})

export const ErrorText = withStyles(getErrorStylesFromProps)(ErrorComponent)

export default withStyles(getStylesFromProps)(InputText)
