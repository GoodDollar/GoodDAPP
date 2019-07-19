// @flow
import React from 'react'
import { StyleSheet, TextInput, View } from 'react-native'
import { HelperText } from 'react-native-paper'
import { withStyles } from '../../../lib/styles'

const InputText = ({ error, styles, style, ...props }: any) => {
  return (
    <View style={styles.view}>
      <View style={styles.view}>
        <TextInput {...props} style={[error ? styles.inputError : styles.input, style]} />
      </View>
      <HelperText type="error" visible={error} style={styles.error}>
        {error}
      </HelperText>
    </View>
  )
}

const getStylesFromProps = ({ theme }) => {
  const input = {
    ...theme.fontStyle,
    fontFamily: theme.fonts.slab,
    color: theme.colors.darkGray,
    borderBottomStyle: 'solid',
    borderBottomWidth: StyleSheet.hairlineWidth,
    padding: theme.sizes.defaultHalf,
    borderBottomColor: theme.colors.darkGray,
  }
  return {
    input,
    inputError: {
      ...input,
      color: theme.colors.red,
      borderBottomColor: theme.colors.red,
    },
    view: {
      flex: 1,
    },
    error: {
      paddingLeft: 0,
      textAlign: 'left',
    },
  }
}

export default withStyles(getStylesFromProps)(InputText)
