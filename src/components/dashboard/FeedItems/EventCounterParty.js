import React from 'react'
import { Text } from 'react-native-web'
import { listStyles } from './EventStyles'

const EventCounterParty = ({ feedItem }) => {
  const direction = feedItem.type === 'send' ? 'To' : 'From'
  const withdrawStatusText =
    feedItem.type === 'send' && feedItem.data.endpoint.withdrawStatus
      ? ` by link - ${feedItem.data.endpoint.withdrawStatus}`
      : ''
  return (
    <Text style={listStyles.rowDataText}>
      <Text style={listStyles.direction}>{direction}:</Text>
      <Text style={listStyles.fullName}>{`${feedItem.data.endpoint.fullName}${withdrawStatusText}`}</Text>
    </Text>
  )
}

export default EventCounterParty
