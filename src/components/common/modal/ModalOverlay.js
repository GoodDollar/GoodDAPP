// @flow
import React from 'react'
import { View } from 'react-native'
import { withStyles } from '../../../lib/styles'

const ModalOverlay = (props: any) => {
  const { styles, children, style } = props

  return (
    <View style={styles.modalOverlay}>
      <View style={[styles.modalInnerWrapper, style]}>{children}</View>
    </View>
  )
}

const getStylesFromProps = ({ theme }) => {
  return {
    modalOverlay: {
      alignSelf: 'flex-start',
      backgroundColor: theme.modals.overlayBackgroundColor,
      height: '100vh',
      width: '100vw',
    },
    modalInnerWrapper: {
      alignSelf: 'center',
      maxWidth: '475px',
      flexGrow: 1,
      flexShrink: 0,
      width: '100%',
      paddingBottom: theme.modals.overlayVerticalPadding,
      paddingLeft: theme.modals.overlayHorizontalPadding,
      paddingRight: theme.modals.overlayHorizontalPadding,
      paddingTop: theme.modals.overlayVerticalPadding,
    },
  }
}

export default withStyles(getStylesFromProps)(ModalOverlay)
