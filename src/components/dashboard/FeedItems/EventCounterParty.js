import React from 'react'
import { listStyles } from './EventStyles'
import { Text } from 'react-native-web'

const EventCounterParty = ({ feedItem }) => {
  const direction = feedItem.type === 'send' ? 'To' : 'From'
  const withdrawStatusText =
    feedItem.type === 'send' && feedItem.data.endpoint.withdrawStatus
      ? ` by link - ${feedItem.data.endpoint.withdrawStatus}`
      : ''
  return (
    <Text style={listStyles.rowDataText}>{`${direction}: ${
      feedItem.data.endpoint.fullName
    }${withdrawStatusText}`}</Text>
  )
}

export default EventCounterParty
