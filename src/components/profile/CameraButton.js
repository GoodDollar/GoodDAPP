// @flow
import React from 'react'
import normalize from 'react-native-elements/src/helpers/normalizeText'
import Icon from 'react-native-elements/src/icons/Icon'
import { StyleSheet, View } from 'react-native'

const CameraButton = ({ handleCameraPress, containerStyles = {}, iconStyles = {} }) => (
  <View style={[cameraStyles.container, containerStyles]}>
    <Icon
      onPress={handleCameraPress}
      size={normalize(20)}
      color="#0C263D"
      name="photo-camera"
      reverse
      containerStyle={cameraStyles.icon}
    />
  </View>
)

const cameraStyles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    bottom: 0
  },
  icon: {
    marginHorizontal: 0,
    marginVertical: 0
  }
})

export default CameraButton
