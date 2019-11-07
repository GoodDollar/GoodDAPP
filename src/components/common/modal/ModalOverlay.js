// @flow
import React from 'react'
import { isMobileOnly } from 'mobile-device-detect'
import { View } from 'react-native'
import { withStyles } from '../../../lib/styles'
import { theme } from '../../theme/styles.js'
import { getDesignRelativeHeight } from '../../../lib/utils/sizes'
import { getScreenHeight, getScreenWidth } from '../../../lib/utils/Orientation'

const height = isMobileOnly ? getScreenHeight() : theme.sizes.maxHeightForTabletAndDesktop

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
    width: getScreenWidth(),
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
    paddingLeft: theme.modals.overlayHorizontalPadding,
    paddingRight: theme.modals.overlayHorizontalPadding,
    marginTop: getDesignRelativeHeight(50, false),
    marginBottom: getDesignRelativeHeight(71, false),
  },
})

export default withStyles(getStylesFromProps)(ModalOverlay)
