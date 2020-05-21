// @flow
import React from 'react'
import { withStyles } from '../../lib/styles'
import CircleButtonWrapper from './CircleButtonWrapper'

type CameraButtonProps = {
  handleCameraPress: any => void,
  styles?: any,
  style?: any,
}

const CameraButton = ({ handleCameraPress, styles, style, containerStyle }: CameraButtonProps) => (
  <CircleButtonWrapper
    iconSize={22}
    iconName={'camera'}
    style={[styles.container, style]}
    onPress={handleCameraPress}
    containerStyle={containerStyle}
  />
)

const getStylesFromProps = ({ theme }) => ({
  container: {
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
})

export default withStyles(getStylesFromProps)(CameraButton)
