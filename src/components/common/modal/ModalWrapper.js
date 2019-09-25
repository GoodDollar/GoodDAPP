// @flow
import React from 'react'
import { ScrollView, View } from 'react-native'
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
    leftBorderColor,
    showJaggedEdge = false,
    fullHeight = false,
    showAtBottom,
    showTooltipArrow,
  } = props

  return (
    <ScrollView>
      <ModalOverlay>
        <ModalContainer fullHeight={fullHeight} style={showAtBottom && styles.showAtBottom}>
          <ModalLeftBorder
            showTooltipArrow={showTooltipArrow}
            borderColor={leftBorderColor}
            style={[showJaggedEdge ? styles.modalLeftBorderAddMarginBottom : '']}
          />
          <ModalContents style={showTooltipArrow && styles.shadow}>
            {onClose ? <ModalCloseButton onClose={onClose} /> : null}
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
    borderBottomRightRadius: '0',
  },
  modalLeftBorderAddMarginBottom: {
    marginBottom: theme.modals.jaggedEdgeSize,
  },
  showAtBottom: {
    marginTop: 'auto',
    marginBottom: 10,
  },
  noneShadow: {
    boxShadow: 'none',
  },
  shadow: {
    boxShadow: '0px 2px 4px #00000029',
  },
  triangle: {
    position: 'absolute',
    display: 'block',
    width: '2rem',
    height: '2rem',
    backgroundColor: 'white',
    left: '49%',
    bottom: -10,
    webkitTransform: 'translateX(-50%) rotate(63deg) skewX(37deg)',
    transform: 'translateX(-50%) rotate(63deg) skewX(37deg)',
    boxShadow: 'rgba(0, 0, 0, 0.16) 2px 1px 4px',
  },
})

export default withStyles(getStylesFromProps)(ModalWrapper)
