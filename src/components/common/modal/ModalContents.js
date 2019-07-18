// @flow
import React from 'react'
import { View } from 'react-native'
import { withStyles } from '../../../lib/styles'

const ModalContents = (props: any) => {
  const { styles, children, style } = props

  return <View style={[styles.modalContents, style]}>{children}</View>
}

const getStylesFromProps = ({ theme }) => {
  return {
    modalContents: {
      flexGrow: 1,
      flexShrink: 1,
    },
  }
}

export default withStyles(getStylesFromProps)(ModalContents)
