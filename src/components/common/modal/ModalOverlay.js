// @flow
import React from 'react'
import { View } from 'react-native'
import { withStyles } from '../../../lib/styles'
import { getDesignRelativeHeight } from '../../../lib/utils/sizes'
import { getMaxDeviceHeight } from '../../../lib/utils/Orientation'

const height = getMaxDeviceHeight()

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
    width: '100%',
  },
  customModalInnerWrapper: {
    alignSelf: 'center',
    maxWidth: 475,
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
    maxWidth: 475,
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
