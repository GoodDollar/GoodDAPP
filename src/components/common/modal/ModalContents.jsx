// @flow
import React from 'react'
import { View } from 'react-native'
import { withStyles } from '../../../lib/styles'

const ModalContents = ({ styles, children, style }: any) => (
  <View style={[styles.modalContents, style]}>{children}</View>
)

const getStylesFromProps = ({ theme }) => ({
  modalContents: {
    flexGrow: 1,
    flexShrink: 1,
  },
})

export default withStyles(getStylesFromProps)(ModalContents)
