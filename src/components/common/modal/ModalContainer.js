// @flow
import React from 'react'
import { View } from 'react-native'
import { withStyles } from '../../../lib/styles'
import { lowZIndex } from './styles'

const ModalContainer = ({ styles, children, style, fullHeight }: any) => (
  <View style={[styles.modalContainer, fullHeight && { flexGrow: 1 }, style]}>{children}</View>
)

const getStylesFromProps = ({ theme }) => ({
  modalContainer: {
    display: 'flex',
    flexDirection: 'row',
    position: 'relative',
    width: '100%',
    zIndex: lowZIndex,
  },
})

export default withStyles(getStylesFromProps)(ModalContainer)
