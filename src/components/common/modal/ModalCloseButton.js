// @flow
import React from 'react'
import { Platform, TouchableOpacity, View } from 'react-native'
import { withStyles } from '../../../lib/styles'
import useOnPress from '../../../lib/hooks/useOnPress'
import { mediumZIndex } from './styles'
import CloseSVG from './img/close.svg'

const ModalCloseButton = (props: any) => {
  const { styles, onClose } = props
  const onPress = useOnPress(onClose)

  return (
    <TouchableOpacity style={styles.modalCloseImageContainer} onPress={onPress}>
      <View style={styles.modalCloseImage}>
        <CloseSVG />
      </View>
    </TouchableOpacity>
  )
}

const getStylesFromProps = ({ theme }) => ({
  modalCloseImage: {
    position: 'relative',
  },
  modalCloseImageContainer: {
    position: 'absolute',
    zIndex: mediumZIndex,
    top: -20,
    right: 0,
    width: 37,
    height: 37,
    marginLeft: 'auto',
    marginRight: -(37 / 2),
    ...(Platform.select({
      // required for Android
      android: { elevation: 25 },
    }) || {}),
  },
})

export default withStyles(getStylesFromProps)(ModalCloseButton)
