// @flow
import React from 'react'
import { withStyles } from '../../../lib/styles'
import Text from '../view/Text'

const SectionTitle = (props: any) => {
  const { styles } = props
  return (
    <Text
      textTransform="uppercase"
      style={[styles.title, props.style]}
      color="darkGray"
      fontSize={22}
      fontFamily="medium"
      {...props}
    >
      {props.children}
    </Text>
  )
}

const getStylesFromProps = ({ theme }) => {
  return {
    title: {
      marginBottom: theme.sizes.default,
      marginTop: theme.sizes.default,
    },
  }
}

export default withStyles(getStylesFromProps)(SectionTitle)
