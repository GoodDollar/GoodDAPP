import React from 'react'
import { Icon } from 'react-native-elements'

const EventIcon = ({ type }) => {
  const iconName = ['receive', 'withdraw', 'claim'].includes(type) ? 'call-received' : 'call-made'
  return <Icon raised color="rgb(85, 85, 85)" size={24} name={iconName} />
}

export default EventIcon
