import React from 'react'
import { TouchableHighlight, View } from 'react-native'
import ListEventItem from './ListEventItem'
import { listStyles } from './EventStyles'

/**
 * Render list item according to the type for feed list
 * @param {FeedEventProps} feedEvent - feed event
 * @returns {HTMLElement}
 */
const FeedListItem = props => {
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
        <ListEventItem {...props} />
      </View>
    </TouchableHighlight>
  )
}

export default FeedListItem
