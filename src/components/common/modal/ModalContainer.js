// @flow
import React from 'react'
import { View } from 'react-native'
import { withStyles } from '../../../lib/styles'
import { lowZIndex } from './styles'

const ModalContainer = (props: any) => {
  const { styles, children, style } = props

  return <View style={[styles.modalContainer, style]}>{children}</View>
}

const getStylesFromProps = ({ theme }) => {
  return {
    modalContainer: {
      display: 'flex',
      flexDirection: 'row',
      flexGrow: 1,
      position: 'relative',
      width: '100%',
      zIndex: lowZIndex,
    },
  }
}

export default withStyles(getStylesFromProps)(ModalContainer)
