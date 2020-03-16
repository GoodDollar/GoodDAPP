import React from 'react'
import { Icon } from '../../common'
import { withStyles } from '../../../lib/styles'
import getEventSettingsByType from './EventSettingsByType'

const EventIcon = ({ onAnimationFinish, showAnim = true, type, theme, styles, style, size = 34 }) => {
  const meta = getEventSettingsByType(theme, type)

  if (showAnim && meta.component) {
    const Component = meta.component

    return <Component style={style} width={size} height={size} onFinish={onAnimationFinish} />
  }
  return <Icon color={meta.color} size={size} name={meta.name} style={[styles.eventIcon, style ? style : {}]} />
}

const getStylesFromProps = ({ theme }) => ({
  eventIcon: {
    marginRight: 1,
  },
})

export default withStyles(getStylesFromProps)(EventIcon)
