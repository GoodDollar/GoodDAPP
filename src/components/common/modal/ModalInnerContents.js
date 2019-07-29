// @flow
import React from 'react'
import { View } from 'react-native'
import { withStyles } from '../../../lib/styles'
import { lowZIndex } from './styles'

const ModalInnerContents = ({ styles, children, style }: any) => (
  <View style={[styles.modalInnerContents, style]}>{children}</View>
)

const getStylesFromProps = ({ theme }) => ({
  modalInnerContents: {
    backgroundColor: theme.modals.backgroundColor,
    borderBottomRightRadius: theme.modals.borderRadius,
    borderTopRightRadius: theme.modals.borderRadius,
    boxShadow: '0 20px 24px rgba(0, 0, 0, 0.5)',
    flexGrow: 1,
    padding: theme.modals.contentPadding,
    position: 'relative',
    zIndex: lowZIndex,
  },
})

export default withStyles(getStylesFromProps)(ModalInnerContents)
