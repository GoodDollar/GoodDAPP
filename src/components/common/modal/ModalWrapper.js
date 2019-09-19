// @flow
import React from 'react'
import { ScrollView } from 'react-native'
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
    shadowStyles,
  } = props

  return (
    <ScrollView>
      <ModalOverlay>
        <ModalContainer fullHeight={fullHeight} style={showAtBottom && styles.showAtBottom}>
          <ModalLeftBorder
            borderColor={leftBorderColor}
            style={[showJaggedEdge ? styles.modalLeftBorderAddMarginBottom : '']}
          />
          <ModalContents>
            {onClose ? <ModalCloseButton onClose={onClose} /> : null}
            <ModalInnerContents
              style={[showJaggedEdge ? styles.modalContainerStraightenBottomRightEdge : '', shadowStyles]}
            >
              {children}
            </ModalInnerContents>
            {showJaggedEdge ? <ModalJaggedEdge /> : null}
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
})

export default withStyles(getStylesFromProps)(ModalWrapper)
