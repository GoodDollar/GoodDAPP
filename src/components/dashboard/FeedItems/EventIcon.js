import React from 'react'
import { Icon } from '../../common'
import { withStyles } from '../../../lib/styles'
import getEventSettingsByType from './EventSettingsByType'

const EventIcon = ({ type, theme, styles, style, size = 34 }) => {
  const meta = getEventSettingsByType(theme, type)

  if (meta.name) {
    return <Icon color={meta.color} size={size} name={meta.name} style={[styles.eventIcon, style ? style : {}]} />
  }
  const Component = meta.component

  return <Component style={style} width={size} height={size} />
}

const getStylesFromProps = ({ theme }) => ({
  eventIcon: {
    marginRight: 0,
  },
})

export default withStyles(getStylesFromProps)(EventIcon)
