// @flow
import React from 'react'
import { Platform, TouchableOpacity, View } from 'react-native'
import { withStyles } from '../../../lib/styles'
import useOnPress from '../../../lib/hooks/useOnPress'
import Icon from '../../common/view/Icon'
import { mediumZIndex } from './styles'

const ModalCloseButton = (props: any) => {
  const { styles, onClose } = props
  const onPress = useOnPress(onClose)

  return (
    <TouchableOpacity style={styles.modalCloseImageContainer} onPress={onPress}>
      <View style={styles.modalIconWrapper}>
        <View style={styles.modalCloseImage}>
          <Icon name="close" color="lighterGray" size={20} style={{ margin: 'auto' }} />
        </View>
      </View>
    </TouchableOpacity>
  )
}

const getStylesFromProps = ({ theme }) => ({
  modalIconWrapper: {
    position: 'relative',
    backgroundColor: theme.colors.white,
    borderRadius: 18,
    width: 36,
    height: 36,
    marginLeft: 'auto',
    marginRight: -(37 / 2),
  },
  modalCloseImage: {
    position: 'relative',
    backgroundColor: theme.colors.lightGray,
    borderRadius: 15,
    width: 30,
    height: 30,
    marginLeft: 3,
    marginTop: 3,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCloseImageContainer: {
    position: 'absolute',
    zIndex: mediumZIndex,
    top: -20,
    right: 0,
    width: 36,
    height: 36,
    ...(Platform.select({
      // required for Android
      android: { elevation: 25 },
    }) || {}),
  },
})

export default withStyles(getStylesFromProps)(ModalCloseButton)
