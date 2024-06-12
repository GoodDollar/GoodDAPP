// @flow
import React from 'react'
import { View } from 'react-native'
import { withStyles } from '../../../lib/styles'
import { getFlexStylesFromProps } from './SectionUtils'

const SectionRow = (props: any) => {
  const { styles } = props
  return (
    <View {...props} style={[styles.sectionRow, getFlexStylesFromProps(props), props.style]}>
      {props.children}
    </View>
  )
}

const getStylesFromProps = ({ theme }) => {
  return {
    sectionRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
  }
}

export default withStyles(getStylesFromProps)(SectionRow)
