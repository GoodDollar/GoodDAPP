// @flow
import React from 'react'
import normalize from 'react-native-elements/src/helpers/normalizeText'
import { withStyles } from '../../../lib/styles'
import Text from '../view/Text'

const SectionText = (props: any) => {
  const { styles } = props
  return <Text {...props} style={[styles.text, props.style]} />
}

const getStylesFromProps = ({ theme }) => {
  return {
    text: {
      ...theme.fontStyle,
      fontSize: normalize(14)
    }
  }
}

export default withStyles(getStylesFromProps)(SectionText)
