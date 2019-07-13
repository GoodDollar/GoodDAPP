// @flow
import React from 'react'
import normalize from 'react-native-elements/src/helpers/normalizeText'
import { withStyles } from '../../../lib/styles'
import Text from '../view/Text'

const SectionTitle = (props: any) => {
  const { styles } = props
  return (
    <Text
      {...props}
      style={[styles.title, props.style]}
      color="darkGray"
      fontSize={22}
      fontFamily="medium"
      textTransform="uppercase"
    >
      {props.children}
    </Text>
  )
}

const getStylesFromProps = ({ theme }) => {
  return {
    title: {
      marginBottom: normalize(8),
      marginTop: normalize(8),
    },
  }
}

export default withStyles(getStylesFromProps)(SectionTitle)
