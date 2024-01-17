// @flow
import React from 'react'
import { Platform, View } from 'react-native'
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
    flexGrow: 1,
    padding: theme.modals.contentPadding,
    position: 'relative',
    zIndex: lowZIndex,
    ...Platform.select({
      web: {
        boxShadow: '0 20px 24px rgba(0, 0, 0, 0.5)',
      },
      default: {
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: theme.modals.jaggedEdgeSize,
        },
        shadowOpacity: 0.5,
        shadowRadius: 20,
        elevation: 24,
      },
    }),
  },
})

export default withStyles(getStylesFromProps)(ModalInnerContents)
