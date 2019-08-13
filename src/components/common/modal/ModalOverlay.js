// @flow
import React from 'react'
import { View } from 'react-native'
import { withStyles } from '../../../lib/styles'
import { getScreenHeight } from '../../../lib/utils/Orientation'

const vh = getScreenHeight() * 0.01

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
    paddingBottom: `${15 * vh}px`,
    paddingLeft: theme.modals.overlayHorizontalPadding,
    paddingRight: theme.modals.overlayHorizontalPadding,
    paddingTop: `${15 * vh}px`,
    marginVertical: 'auto',
  },
})

export default withStyles(getStylesFromProps)(ModalOverlay)
