// @flow
import React from 'react'
import { TextInput } from 'react-native-paper'
import normalize from 'react-native-elements/src/helpers/normalizeText'
import { withStyles } from '../../../lib/styles'

const InputText = (props: any) => {
  return <TextInput {...props} />
}

const getStylesFromProps = ({ theme }) => {
  return {
    input: {
      ...theme.fontStyle,
      fontSize: normalize(24),
      fontWeight: '500',
      textTransform: 'uppercase'
    }
  }
}

export default withStyles(getStylesFromProps)(InputText)
