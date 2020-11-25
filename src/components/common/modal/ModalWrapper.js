// @flow
import React from 'react'
import { ScrollView, View } from 'react-native'
import { isMobileOnly } from '../../../lib/utils/platform'
import { getShadowStyles } from '../../../lib/utils/getStyles'
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
  noneShadow: getShadowStyles('none'),
  shadow: getShadowStyles('0px 2px 4px #00000029', {
    shadowColor: '#00000029',
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 4,
  }),
  triangle: {
    position: 'absolute',
    display: 'flex',
    width: 24,
    height: 24,
    backgroundColor: 'white',
    left: '49%',
    bottom: -10,

    // transform: 'translateX(-50%) rotate(63deg) skewX(37deg)',
    transform: [{ translateX: '-50%' }, { rotate: '63deg' }, { skewX: '37deg' }],

    ...getShadowStyles('2px 1px 4px rgba(0, 0, 0, 0.16) ', {
      shadowColor: 'rgba(0, 0, 0, 0.16)',
      shadowOffset: { width: 2, height: 1 },
      shadowRadius: 4,
      elevation: 4,
    }),
  },
})

export default withStyles(getStylesFromProps)(ModalWrapper)
