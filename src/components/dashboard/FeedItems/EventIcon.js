import React from 'react'
import { Icon } from '../../common'
import { withStyles } from '../../../lib/styles'
import getEventSettingsByType from './EventSettingsByType'

const EventIcon = ({ onAnimationFinish, showAnim = true, delay, type, theme, styles, style, animStyle, size = 34 }) => {
  const meta = getEventSettingsByType(theme, type)

  if (meta.component) {
    const AnimComponent = meta.component

    return <AnimComponent style={animStyle} showAnim={showAnim} delay={delay} onFinish={onAnimationFinish} />
  }

  return <Icon color={meta.color} size={size} name={meta.name} style={[styles.eventIcon, style ? style : {}]} />
}

const getStylesFromProps = ({ theme }) => ({
  eventIcon: {
    marginRight: 1,
  },
})

export default withStyles(getStylesFromProps)(EventIcon)
