// @flow
import React from 'react'
import { Image, TouchableOpacity } from 'react-native'
import { withStyles } from '../../../lib/styles'
import { mediumZIndex } from './styles'

const ModalCloseButton = (props: any) => {
  const { styles, onClose } = props
  const closeButton = require('./img/close.png')

  return (
    <TouchableOpacity style={styles.modalCloseImageContainer} onPress={onClose}>
      <Image style={styles.modalCloseImage} source={closeButton} />
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
    top: -20,
    right: 0,
    height: 37,
    marginLeft: 'auto',
    marginRight: -(37 / 2),
    width: 37,
  },
})

export default withStyles(getStylesFromProps)(ModalCloseButton)
