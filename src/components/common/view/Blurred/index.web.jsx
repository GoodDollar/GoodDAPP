import React, { useMemo } from 'react'
import { View } from 'react-native'

import { withStyles } from '../../../../lib/styles'

import useBlurredState from './useBlurredState'

const Blurred = ({ styles, children, whenDialog = false, whenSideMenu = false }) => {
  const [isBlurred, blurStyle] = useBlurredState({ whenDialog, whenSideMenu })

  const viewStyles = useMemo(() => {
    const computedStyle = [styles.fullScreen, blurStyle]

    if (isBlurred) {
      computedStyle.push(styles.blurFx)
    }

    return computedStyle
  }, [isBlurred, blurStyle, styles])

  return (
    <View
      style={{
        flex: 1,
      }}
    >
      <View style={viewStyles}>{children}</View>
    </View>
  )
}

const getStylesFromProps = () => ({
  fullScreen: {
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    position: 'absolute',
    display: 'flex',
    flexGrow: 1,
    flexDirection: 'column',
    overflow: 'hidden',
  },
  blurFx: {
    filter: 'blur(24px) brightness(0.8) opacity(0.5)',
  },
})

export default withStyles(getStylesFromProps)(Blurred)
