// @flow
import React from 'react'
import { withStyles } from '../../lib/styles'
import CircleButtonWrapper from './CircleButtonWrapper'

type CameraButtonProps = {
  handleCameraPress: any => void,
  styles?: any,
}

const CameraButton = ({ handleCameraPress, styles }: CameraButtonProps) => (
  <CircleButtonWrapper iconSize={22} iconName={'camera'} style={[styles.container]} onPress={handleCameraPress} />
)

const getStylesFromProps = ({ theme }) => ({
  container: {
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
})

export default withStyles(getStylesFromProps)(CameraButton)
