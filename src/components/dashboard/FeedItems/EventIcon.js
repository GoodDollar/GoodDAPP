import React from 'react'
import { Icon } from 'react-native-elements'
import { listStyles } from './EventStyles'

const EventIcon = ({ type }) => {
  const iconName = type === 'send' ? 'call-made' : 'call-received'
  return <Icon raised color="rgb(85, 85, 85)" size={16} name={iconName} containerStyle={listStyles.eventIcon} />
}

export default EventIcon
