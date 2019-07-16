// @flow
import React from 'react'
import { View } from 'react-native'
import { withStyles } from '../../../lib/styles'
import wavePattern from '../../../assets/wave.svg'
import { mediumZIndex } from './styles'

const ModalLeftBorder = (props: any) => {
  const { styles, theme, borderColor = theme.colors.lightGray, style } = props

  return <View style={[styles.modalLeftBorder, { backgroundColor: borderColor }, style]} />
}

const getStylesFromProps = ({ theme }) => {
  return {
    modalLeftBorder: {
      backgroundImage: `url(${wavePattern})`,
      backgroundRepeat: 'repeat-y',
      borderBottomLeftRadius: theme.modals.borderRadius,
      borderTopLeftRadius: theme.modals.borderRadius,
      flexGrow: 1,
      flexShrink: 0,
      maxWidth: theme.modals.borderLeftWidth,
      minWidth: theme.modals.borderLeftWidth,
      position: 'relative',
      zIndex: mediumZIndex,
    },
  }
}

export default withStyles(getStylesFromProps)(ModalLeftBorder)
