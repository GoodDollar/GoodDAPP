// @flow
import React from 'react'
import { StyleSheet, View } from 'react-native'
import { withTheme } from 'react-native-paper'
import Icon from 'react-native-elements/src/icons/Icon'
import normalize from '../../lib/utils/normalizeText'

type CameraButtonProps = {
  handleCameraPress: any => void,
  containerStyles: any,
  theme: any,
}

const CameraButton = ({ handleCameraPress, containerStyles, theme }: CameraButtonProps) => (
  <View style={[styles.container, containerStyles]}>
    <Icon
      onPress={handleCameraPress}
      size={normalize(20)}
      color={theme.colors.darkBlue}
      name="photo-camera"
      reverse
      containerStyle={styles.icon}
    />
  </View>
)

CameraButton.defaultProps = {
  containerStyles: {},
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    bottom: 0,
  },
  icon: {
    marginHorizontal: 0,
    marginVertical: 0,
  },
})

export default withTheme(CameraButton)
