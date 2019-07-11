// @flow
import React from 'react'
import { StyleSheet, TextInput } from 'react-native'
import { withStyles } from '../../../lib/styles'

const InputText = (props: any) => {
  return <TextInput style={props.styles.input} {...props} />
}

const getStylesFromProps = ({ theme }) => {
  return {
    input: {
      ...theme.fontStyle,
      fontStyle: theme.fonts.slab,
      color: theme.colors.darkGray,
      borderBottomStyle: 'solid',
      borderBottomWidth: StyleSheet.hairlineWidth,
      padding: theme.sizes.default,
      borderBottomColor: theme.colors.darkGray
    }
  }
}

export default withStyles(getStylesFromProps)(InputText)
