// @flow
import React from 'react'
import CircleButtonWrapper from './CircleButtonWrapper'

type CameraButtonProps = {
  handleCameraPress: any => void,
  styles?: any,
  style?: any,
}

const CameraButton = ({ icon, handleCameraPress, styles, style, noStyles, containerStyle }: CameraButtonProps) => (
  <CircleButtonWrapper
    iconSize={22}
    iconName={icon}
    style={!noStyles && style}
    onPress={handleCameraPress}
    containerStyle={containerStyle}
  />
)

export default CameraButton
