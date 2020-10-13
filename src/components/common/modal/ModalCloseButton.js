// @flow
import React from 'react'
import { Image, Platform, TouchableOpacity } from 'react-native'
import { withStyles } from '../../../lib/styles'
import { mediumZIndex } from './styles'
import CloseSVG from './img/close.svg'

Image.prefetch(CloseSVG)

const ModalCloseButton = (props: any) => {
  const { styles, onClose } = props

  return (
    <TouchableOpacity style={styles.modalCloseImageContainer} onPress={onClose}>
      <Image style={styles.modalCloseImage} source={CloseSVG} />
    </TouchableOpacity>
  )
}

const getStylesFromProps = ({ theme }) => ({
  modalCloseImageContainer: {
    position: 'relative',
    zIndex: mediumZIndex,
  },
  modalCloseImage: {
    position: 'absolute',
    zIndex: mediumZIndex,
    top: -20,
    right: 0,
    height: 37,
    marginLeft: 'auto',
    marginRight: -(37 / 2),
    width: 37,
    ...(Platform.select({
      // required for Android
      android: { elevation: 25 },
    }) || {}),
  },
})

export default withStyles(getStylesFromProps)(ModalCloseButton)
