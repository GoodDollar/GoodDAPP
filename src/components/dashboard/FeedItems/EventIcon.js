import React from 'react'
import { Icon } from '../../common'
import { withStyles } from '../../../lib/styles'
import getEventSettingsByType from './EventSettingsByType'

const EventIcon = ({ type, theme, styles, style, size = 34 }) => {
  const icon = getEventSettingsByType(theme, type)
  return <Icon color={icon.color} size={size} name={icon.name} style={[styles.eventIcon, style ? style : {}]} />
}

const getStylesFromProps = ({ theme }) => ({
  eventIcon: {
    marginRight: 0,
  },
})

export default withStyles(getStylesFromProps)(EventIcon)
