// @flow
import React from 'react'
import { isMobileSafari } from 'mobile-device-detect'
import { View } from 'react-native'
import { withStyles } from '../../../lib/styles'

const browserPadding = isMobileSafari ? 44 : 0

const ModalOverlay = ({ styles, children, style }: any) => (
  <View style={styles.modalOverlay}>
    <View style={[styles.modalInnerWrapper, style]}>{children}</View>
  </View>
)

const getStylesFromProps = ({ theme }) => ({
  modalOverlay: {
    alignSelf: 'flex-start',
    backgroundColor: theme.modals.overlayBackgroundColor,
    height: '100vh',
    width: '100vw',
  },
  modalInnerWrapper: {
    alignSelf: 'center',
    maxWidth: '475px',
    width: '100%',
    flexGrow: 1,
    flexShrink: 0,
    paddingBottom: theme.modals.overlayVerticalPadding + browserPadding * 1.5,
    paddingLeft: theme.modals.overlayHorizontalPadding,
    paddingRight: theme.modals.overlayHorizontalPadding,
    paddingTop: theme.modals.overlayVerticalPadding - browserPadding * 0.5,
    marginVertical: 'auto',
  },
})

export default withStyles(getStylesFromProps)(ModalOverlay)
