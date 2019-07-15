// @flow
import React from 'react'
import { Image, ScrollView, TouchableOpacity, View } from 'react-native'
import normalize from 'react-native-elements/src/helpers/normalizeText'
import { withStyles } from '../../../lib/styles'
import wavePattern from '../../../assets/wave.svg'

const ModalWrapper = (props: any) => {
  const { styles, children, theme, onClose, leftBorderColor = theme.colors.lightGray, showJaggedEdge = false } = props
  const closeButton = require('./img/close.png')
  const borderColor = { backgroundColor: leftBorderColor }

  return (
    <ScrollView>
      <View style={styles.modalOverlay}>
        {onClose ? (
          <TouchableOpacity style={styles.modalCloseImageContainer} onPress={onClose}>
            <Image style={styles.modalCloseImage} source={closeButton} />
          </TouchableOpacity>
        ) : null}
        <View style={styles.modalContainer}>
          <View
            style={[styles.modalLeftBorder, borderColor, showJaggedEdge ? styles.modalLeftBorderAddMarginBottom : '']}
          />
          <View style={styles.modalContents}>
            <View
              style={[styles.modalInnerContents, showJaggedEdge ? styles.modalContainerStraightenBottomRightEdge : '']}
            >
              {children}
            </View>
            {showJaggedEdge ? <View style={styles.jaggedEdge} /> : null}
          </View>
        </View>
      </View>
    </ScrollView>
  )
}

const lowZIndex = 1
const mediumZIndex = 5
const getStylesFromProps = ({ theme }) => {
  return {
    modalOverlay: {
      alignSelf: 'flex-start',
      backgroundColor: theme.modals.overlayBackgroundColor,
      flexGrow: 1,
      flexShrink: 0,
      height: '100vh',
      paddingBottom: theme.modals.overlayVerticalPadding,
      paddingLeft: theme.modals.overlayHorizontalPadding,
      paddingRight: theme.modals.overlayHorizontalPadding,
      paddingTop: theme.modals.overlayVerticalPadding,
      width: '100vw',
    },
    modalCloseImageContainer: {
      position: 'relative',
      zIndex: mediumZIndex,
    },
    modalCloseImage: {
      height: normalize(37),
      marginBottom: -normalize(37 / 2),
      marginLeft: 'auto',
      marginRight: -normalize(37 / 2),
      width: normalize(37),
    },
    modalContainer: {
      display: 'flex',
      flexDirection: 'row',
      flexGrow: 1,
      position: 'relative',
      width: '100%',
      zIndex: lowZIndex,
    },
    modalInnerContents: {
      backgroundColor: theme.modals.backgroundColor,
      borderBottomRightRadius: theme.modals.borderRadius,
      borderTopRightRadius: theme.modals.borderRadius,
      boxShadow: '0 19px 38px rgba(0, 0, 0, 0.5)',
      flexGrow: 1,
      padding: theme.modals.contentPadding,
      position: 'relative',
      zIndex: lowZIndex,
    },
    modalContainerStraightenBottomRightEdge: {
      borderBottomRightRadius: '0',
    },
    modalLeftBorder: {
      backgroundImage: `url(${wavePattern})`,
      backgroundRepeat: 'repeat-Y',
      borderBottomLeftRadius: theme.modals.borderRadius,
      borderTopLeftRadius: theme.modals.borderRadius,
      flexGrow: 1,
      flexShrink: 0,
      maxWidth: theme.modals.borderLeftWidth,
      minWidth: theme.modals.borderLeftWidth,
      position: 'relative',
      zIndex: mediumZIndex,
    },
    modalLeftBorderAddMarginBottom: {
      marginBottom: theme.modals.jaggedEdgeSize,
    },
    modalContents: {
      flexGrow: 1,
      flexShrink: 1,
    },
    jaggedEdge: {
      backgroundImage: `linear-gradient(45deg, transparent 75%, ${
        theme.modals.backgroundColor
      } 76%), linear-gradient(-45deg, transparent 75%, ${theme.modals.backgroundColor} 76%)`,
      backgroundPosition: '0 0',
      backgroundRepeat: 'repeat-x',
      backgroundSize: `${theme.modals.jaggedEdgeSize}px`,
      height: theme.modals.jaggedEdgeSize,
      position: 'relative',
      width: '100%',
      zIndex: mediumZIndex,
    },
  }
}

export default withStyles(getStylesFromProps)(ModalWrapper)
