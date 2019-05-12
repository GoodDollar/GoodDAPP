import React from 'react'
import { listStyles } from './EventStyles'
import { Text } from 'react-native-web'

const EventCounterParty = ({ feedItem }) => {
  const direction = ['receive', 'withdraw', 'claim'].includes(feedItem.type) ? 'From' : 'To'
  const directionName = feedItem.type === 'claim' ? 'Good Dollar' : feedItem.data.endpoint.fullName
  const withdrawStatusText =
    feedItem.type === 'send' && feedItem.data.endpoint.withdrawStatus
      ? ` by link - ${feedItem.data.endpoint.withdrawStatus}`
      : ''
  return <Text style={listStyles.rowDataText}>{`${direction}: ${directionName}${withdrawStatusText}`}</Text>
}

export default EventCounterParty
