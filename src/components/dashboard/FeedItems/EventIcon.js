import React from 'react'
import { withStyles } from '../../../lib/styles'
import getEventSettingsByType from './EventSettingsByType'

const EventIcon = ({ onAnimationFinish, showAnim = true, type, theme, styles, style, size = 34 }) => {
  const meta = getEventSettingsByType(theme, type)
  const Component = meta.component

  return (
    <Component
      style={[styles.eventIcon, style]}
      width={size}
      height={size}
      onFinish={onAnimationFinish}
      asImage={!showAnim}
    />
  )
}

const getStylesFromProps = ({ theme }) => ({
  eventIcon: {
    marginRight: 0,
  },
})

export default withStyles(getStylesFromProps)(EventIcon)
