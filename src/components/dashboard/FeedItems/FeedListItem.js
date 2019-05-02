import React from 'react'
import { TouchableHighlight, View } from 'react-native'
import ListWithdrawEvent from './ListWithdrawEvent'
import ListSendEvent from './ListSendEvent'
import ListClaimEvent from './ListClaimEvent'
import { listStyles } from './EventStyles'

const listType = type => {
  return (
    {
      withdraw: ListWithdrawEvent,
      send: ListSendEvent,
      claim: ListClaimEvent
    }[type] || ListWithdrawEvent
  )
}

/**
 * Render list item according to the type for feed list
 * @param {FeedEventProps} feedEvent - feed event
 * @returns {HTMLElement}
 */
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
      <View style={{ flex: 1 }}>
        <Item {...props} />
      </View>
    </TouchableHighlight>
  )
}

export default FeedListItem
