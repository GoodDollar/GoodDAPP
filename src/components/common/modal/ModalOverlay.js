// @flow
import React from 'react'
import { isMobileSafari } from 'mobile-device-detect'
import { View } from 'react-native'
import { withStyles } from '../../../lib/styles'
import { getDesignRelativeHeight } from '../../../lib/utils/sizes'
const browserPadding = isMobileSafari ? 44 : 0

const ModalOverlay = ({ styles, children, style, itemType }: any) => {
  const modalInnerWrapperStyle = itemType === 'custom' ? styles.customModalInnerWrapper : styles.feedModalInnerWrapper
  return (
    <View style={styles.modalOverlay}>
      <View style={[modalInnerWrapperStyle, style]}>{children}</View>
    </View>
  )
}

const getStylesFromProps = ({ theme }) => ({
  modalOverlay: {
    alignSelf: 'flex-start',
    backgroundColor: theme.modals.overlayBackgroundColor,
    height: '100vh',
    width: '100vw',
  },
  customModalInnerWrapper: {
    alignSelf: 'center',
    maxWidth: '475px',
    width: '100%',
    flexGrow: 1,
    flexShrink: 0,
    paddingLeft: theme.modals.overlayHorizontalPadding,
    paddingRight: theme.modals.overlayHorizontalPadding,
    marginVertical: 'auto',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    display: 'flex',
  },
  feedModalInnerWrapper: {
    alignSelf: 'center',
    maxWidth: '475px',
    width: '100%',
    flexGrow: 1,
    flexShrink: 0,
    paddingBottom: theme.modals.overlayVerticalPadding + browserPadding * 1.5,
    paddingLeft: theme.modals.overlayHorizontalPadding,
    paddingRight: theme.modals.overlayHorizontalPadding,
    paddingTop: theme.modals.overlayVerticalPadding - browserPadding * 0.5,
    marginTop: getDesignRelativeHeight(50,true),
  },
})

export default withStyles(getStylesFromProps)(ModalOverlay)
