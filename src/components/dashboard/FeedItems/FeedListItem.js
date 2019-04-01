import React from 'react'
import { TouchableHighlight, View } from 'react-native'
import ListWithdrawEvent from './ListWithdrawEvent'
import ListSendEvent from './ListSendEvent'
import ListNotificationEvent from './ListNotificationEvent'
import ListMessageEvent from './ListMessageEvent'
import ListConfirmationEvent from './ListConfirmationEvent'
import { listStyles } from './EventStyles'

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
  return (
    <TouchableHighlight
      onPress={() => props.onPress(props.item.id)}
      onShowUnderlay={props.separators.highlight}
      onHideUnderlay={props.separators.unhighlight}
      tvParallaxProperties={{
        pressMagnification: 1.1
      }}
      style={listStyles.row}
    >
      <View>
        <Item {...props} />
      </View>
    </TouchableHighlight>
  )
}

export default FeedListItem
