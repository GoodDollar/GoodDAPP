// @flow

import React from 'react'
import { Image, StyleSheet, View } from 'react-native'
import { withStyles } from '../../../lib/styles'
import wavePattern from '../../../assets/wave.svg'
import wavePatternForTooltipArrow from '../../../assets/feedListItemPattern.svg'
import { mediumZIndex } from './styles'

const ModalLeftBorderWeb = (props: any) => {
  const { styles, theme, borderColor = theme.colors.lightGray, style, showTooltipArrow } = props
  const pattern = showTooltipArrow ? wavePatternForTooltipArrow : wavePattern

  return (
    <View style={[styles.modalLeftBorder, { backgroundColor: borderColor }, style]}>
      <Image source={pattern} style={[StyleSheet.absoluteFill]} resizeMode="cover" />
    </View>
  )
}

const getStylesFromProps = ({ theme }) => ({
  modalLeftBorder: {
    borderBottomLeftRadius: theme.modals.borderRadius,
    borderTopLeftRadius: theme.modals.borderRadius,
    flexGrow: 1,
    flexShrink: 0,
    maxWidth: theme.modals.borderLeftWidth,
    minWidth: theme.modals.borderLeftWidth,
    position: 'relative',
    zIndex: mediumZIndex,
    overflow: 'hidden',
  },
})

export default withStyles(getStylesFromProps)(ModalLeftBorderWeb)
