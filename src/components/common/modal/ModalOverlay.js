// @flow
import React from 'react'
import { View } from 'react-native'
import { withStyles } from '../../../lib/styles'

const ModalOverlay = (props: any) => {
  const { styles, children, style } = props

  return <View style={[styles.modalOverlay, style]}>{children}</View>
}

const getStylesFromProps = ({ theme }) => {
  return {
    modalOverlay: {
      alignSelf: 'flex-start',
      backgroundColor: theme.modals.overlayBackgroundColor,
      flexGrow: 1,
      flexShrink: 0,
      height: '100vh',
      paddingBottom: theme.modals.overlayVerticalPadding,
      paddingLeft: theme.modals.overlayHorizontalPadding,
      paddingRight: theme.modals.overlayHorizontalPadding,
      paddingTop: theme.modals.overlayVerticalPadding,
      width: '100vw',
    },
  }
}

export default withStyles(getStylesFromProps)(ModalOverlay)
