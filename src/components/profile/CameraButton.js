// @flow
import React from 'react'
import { withStyles } from '../../lib/styles'
import useOnPress from '../../lib/hooks/useOnPress'
import CircleButtonWrapper from './CircleButtonWrapper'

type CameraButtonProps = {
  handleCameraPress: any => void,
  styles?: any,
  style?: any,
}

const CameraButton = ({ handleCameraPress, styles, style, noStyles, containerStyle }: CameraButtonProps) => {
  const _handleCameraPress = useOnPress(handleCameraPress, [handleCameraPress])
  return (
    <CircleButtonWrapper
      iconSize={22}
      iconName={'camera'}
      style={!noStyles && [styles.container, style]}
      onPress={_handleCameraPress}
      containerStyle={containerStyle}
    />
  )
}

const getStylesFromProps = ({ theme }) => ({
  container: {
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
})

export default withStyles(getStylesFromProps)(CameraButton)
