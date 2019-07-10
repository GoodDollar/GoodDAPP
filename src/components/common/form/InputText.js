// @flow
import React from 'react'
import { TextInput } from 'react-native'
import normalize from 'react-native-elements/src/helpers/normalizeText'
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
      borderBottomWidth: normalize(1),
      padding: theme.sizes.default,
      borderBottomColor: theme.colors.darkGray
    }
  }
}

export default withStyles(getStylesFromProps)(InputText)
