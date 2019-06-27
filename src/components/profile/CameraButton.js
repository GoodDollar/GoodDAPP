// @flow
import React from 'react'
import normalize from 'react-native-elements/src/helpers/normalizeText'
import IconButton from 'react-native-paper/src/components/IconButton'
import { StyleSheet, View } from 'react-native-web'

const CameraButton = ({ handleCameraPress, containerStyles = {}, iconStyles = {} }) => (
  <View style={[cameraStyles.container, containerStyles]}>
    <IconButton
      onPress={handleCameraPress}
      size={normalize(24)}
      color="white"
      icon="photo-camera"
      style={[cameraStyles.icon, iconStyles]}
    />
  </View>
)

const cameraStyles = StyleSheet.create({
  container: {
    backgroundColor: 'darkblue',
    position: 'absolute',
    borderRadius: normalize(18),
    width: normalize(36),
    height: normalize(36),
    left: 0,
    bottom: 0
  },
  icon: { position: 'absolute', left: normalize(-6), top: normalize(-5) }
})

export default CameraButton
