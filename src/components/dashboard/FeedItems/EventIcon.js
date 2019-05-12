import React from 'react'
import { Icon } from 'react-native-elements'

const EventIcon = ({ type }) => {
  const iconName = type === 'send' ? 'call-made' : 'call-received'
  return <Icon raised color="rgb(85, 85, 85)" size={24} name={iconName} />
}

export default EventIcon
