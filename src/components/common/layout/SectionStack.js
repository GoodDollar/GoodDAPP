// @flow
import React from 'react'
import { View } from 'react-native'
import { withStyles } from '../../../lib/styles'
import { getFlexStylesFromProps } from './SectionUtils'

const SectionStack = (props: any) => {
  const { styles } = props
  return (
    <View {...props} style={[styles.sectionStack, getFlexStylesFromProps(props), props.style]}>
      {props.children}
    </View>
  )
}

const getStylesFromProps = ({ theme }) => {
  return {
    sectionStack: {
      flexDirection: 'column',
      alignItems: 'stretch',
      justifyContent: 'space-between'
    }
  }
}

export default withStyles(getStylesFromProps)(SectionStack)
