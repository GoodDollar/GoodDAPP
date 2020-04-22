// @flow

import React from 'react'
import { StyleSheet, View } from 'react-native'
import { withStyles } from '../../../lib/styles'
import WavePatternSVG from '../../../assets/wave.svg'
import WavePatternForTooltipArrowSVG from '../../../assets/feedListItemPattern.svg'
import { mediumZIndex } from './styles'

const ModalLeftBorderWeb = (props: any) => {
  const { styles, theme, borderColor = theme.colors.lightGray, style, showTooltipArrow } = props
  const SVG = showTooltipArrow ? WavePatternForTooltipArrowSVG : WavePatternSVG

  return (
    <View style={[styles.modalLeftBorder, { backgroundColor: borderColor }, style]}>
      <View style={[StyleSheet.absoluteFill]}>
        <SVG />
        <SVG />
      </View>
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
