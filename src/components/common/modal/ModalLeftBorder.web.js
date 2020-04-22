// @flow
import React from 'react'
import { View } from 'react-native'
import { withStyles } from '../../../lib/styles'
import { url as wavePattern } from '../../../assets/wave.svg'
import { url as wavePatternForTooltipArrow } from '../../../assets/feedListItemPattern.svg'
import { mediumZIndex } from './styles'

const ModalLeftBorderWeb = (props: any) => {
  const { styles, theme, borderColor = theme.colors.lightGray, style, showTooltipArrow } = props
  return (
    <View
      style={[
        styles.modalLeftBorder,
        showTooltipArrow ? styles.tooltipArrowBackground : '',
        { backgroundColor: borderColor },
        style,
      ]}
    />
  )
}

const getStylesFromProps = ({ theme }) => ({
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
  tooltipArrowBackground: {
    backgroundImage: `url(${wavePatternForTooltipArrow})`,
  },
})

export default withStyles(getStylesFromProps)(ModalLeftBorderWeb)
