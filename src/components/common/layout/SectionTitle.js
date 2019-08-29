// @flow
import React from 'react'
import { withStyles } from '../../../lib/styles'
import Text from '../view/Text'

const SectionTitle = (props: any) => {
  const { styles } = props
  return (
    <Text fontSize={24} style={[styles.title, props.style]} textTransform="uppercase" {...props}>
      {props.children}
    </Text>
  )
}

const getStylesFromProps = ({ theme }) => ({
  title: {
    marginVertical: theme.sizes.default,
  },
})

export default withStyles(getStylesFromProps)(SectionTitle)
