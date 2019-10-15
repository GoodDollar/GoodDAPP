// @flow
import React from 'react'
import { isMobileOnly, isMobileSafari } from 'mobile-device-detect'
import { View } from 'react-native'
import { withStyles } from '../../../lib/styles'
import { theme } from '../../theme/styles.js'
import { getDesignRelativeHeight } from '../../../lib/utils/sizes'
const browserPadding = isMobileSafari ? 44 : 0

const height = isMobileOnly ? '100vh' : theme.sizes.maxHeightForTabletAndDesktop

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
    height: height,
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
    marginTop: getDesignRelativeHeight(50, false),
  },
})

export default withStyles(getStylesFromProps)(ModalOverlay)
