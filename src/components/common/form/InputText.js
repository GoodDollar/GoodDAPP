// @flow
import React from 'react'
import { StyleSheet, TextInput } from 'react-native'
import { withStyles } from '../../../lib/styles'

const InputText = (props: any) => {
  return <TextInput {...props} style={[props.styles.input, props.style]} />
}

const getStylesFromProps = ({ theme }) => {
  return {
    input: {
      ...theme.fontStyle,
      fontFamily: theme.fonts.slab,
      color: theme.colors.darkGray,
      borderBottomStyle: 'solid',
      borderBottomWidth: StyleSheet.hairlineWidth,
      padding: theme.sizes.defaultHalf,
      borderBottomColor: theme.colors.darkGray,
    },
  }
}

export default withStyles(getStylesFromProps)(InputText)
