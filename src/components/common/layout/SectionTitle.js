// @flow
import React from 'react'
import normalize from 'react-native-elements/src/helpers/normalizeText'
import { withStyles } from '../../../lib/styles'
import Text from '../view/Text'

const SectionTitle = (props: any) => {
  const { styles } = props
  return (
    <Text {...props} style={[styles.title, props.style]}>
      {props.children}
    </Text>
  )
}

const getStylesFromProps = ({ theme }) => {
  return {
    title: {
      ...theme.fontStyle,
      fontSize: normalize(24),
      fontWeight: '500',
      textTransform: 'uppercase'
    }
  }
}

export default withStyles(getStylesFromProps)(SectionTitle)
