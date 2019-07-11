import React from 'react'
import { withTheme } from 'react-native-paper'
import { Icon } from '../../common'
import { listStyles } from './EventStyles'
import getEventSettingsByType from './EventSettingsByType'

const EventIcon = ({ type, theme, style }) => {
  const icon = getEventSettingsByType(theme, type)
  return <Icon color={icon.color} size={34} name={icon.name} style={[listStyles.eventIcon, style]} />
}

export default withTheme(EventIcon)
