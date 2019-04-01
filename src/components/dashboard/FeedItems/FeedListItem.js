import React from 'react'
import ListWithdrawEvent from './ListWithdrawEvent'
import ListSendEvent from './ListSendEvent'
import ListNotificationEvent from './ListNotificationEvent'
import ListMessageEvent from './ListMessageEvent'
import ListConfirmationEvent from './ListConfirmationEvent'

const listType = type => {
  return (
    {
      withdraw: ListWithdrawEvent,
      send: ListSendEvent,
      notification: ListNotificationEvent,
      message: ListMessageEvent,
      confirmation: ListConfirmationEvent
    }[type] || ListMessageEvent
  )
}

const FeedListItem = props => {
  const Item = listType(props.item.type)
  return <Item {...props} />
}

export default FeedListItem
