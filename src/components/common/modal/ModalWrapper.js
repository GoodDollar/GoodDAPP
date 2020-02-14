// @flow
import React from 'react'
import { Platform, ScrollView, View } from 'react-native'
import { isMobileOnly } from 'mobile-device-detect'
import { rem } from '../../../lib/utils/sizes'
import { withStyles } from '../../../lib/styles'
import ModalCloseButton from './ModalCloseButton'
import ModalJaggedEdge from './ModalJaggedEdge'
import ModalLeftBorder from './ModalLeftBorder'
import ModalContents from './ModalContents'
import ModalOverlay from './ModalOverlay'
import ModalInnerContents from './ModalInnerContents'
import ModalContainer from './ModalContainer'

const ModalWrapper = (props: any) => {
  const {
    styles,
    children,
    onClose,
    showCloseButtons = true,
    leftBorderColor,
    showJaggedEdge = false,
    fullHeight = false,
    showAtBottom,
    itemType,
    showTooltipArrow,
    isMinHeight = true,
  } = props

  return (
    <ScrollView>
      <ModalOverlay itemType={itemType}>
        <ModalContainer
          fullHeight={fullHeight}
          style={[
            showAtBottom && styles.showAtBottom,
            !isMobileOnly && styles.maxHeightBlock,
            isMinHeight && styles.minHeightBlock,
          ]}
        >
          <ModalLeftBorder
            showTooltipArrow={showTooltipArrow}
            borderColor={leftBorderColor}
            style={[showJaggedEdge ? styles.modalLeftBorderAddMarginBottom : '']}
          />
          <ModalContents style={showTooltipArrow && styles.shadow}>
            {showCloseButtons && onClose ? <ModalCloseButton onClose={onClose} /> : null}
            <ModalInnerContents
              style={[
                showJaggedEdge ? styles.modalContainerStraightenBottomRightEdge : '',
                showTooltipArrow && styles.noneShadow,
              ]}
            >
              {children}
            </ModalInnerContents>
            {showJaggedEdge ? <ModalJaggedEdge /> : null}
            {showTooltipArrow && <View style={styles.triangle} />}
          </ModalContents>
        </ModalContainer>
      </ModalOverlay>
    </ScrollView>
  )
}

const getStylesFromProps = ({ theme }) => ({
  modalContainerStraightenBottomRightEdge: {
    borderBottomRightRadius: 0,
  },
  modalLeftBorderAddMarginBottom: {
    marginBottom: theme.modals.jaggedEdgeSize,
  },
  showAtBottom: {
    marginTop: 'auto',
    marginBottom: 30,
  },
  maxHeightBlock: {
    maxHeight: theme.sizes.maxHeightForTabletAndDesktop,
  },
  minHeightBlock: {
    minHeight: theme.sizes.minHeightForDialogMessage,
  },
  noneShadow: {
    boxShadow: 'none',
  },
  shadow: {
    boxShadow: '0px 2px 4px #00000029',
  },
  triangle: {
    position: 'absolute',
    display: 'flex',
    width: rem(2),
    height: rem(2),
    backgroundColor: 'white',
    left: '49%',
    bottom: -10,
    transform: [
      {
        translateX: Platform.select({
          web: '-50%',
          default: 0,
        }),
        rotate: '63deg',
        skewX: '37deg',
      },
    ],
    boxShadow: 'rgba(0, 0, 0, 0.16) 2px 1px 4px',
  },
})

export default withStyles(getStylesFromProps)(ModalWrapper)
