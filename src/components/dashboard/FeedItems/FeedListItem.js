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
      tvParallaxProperties={{
        pressMagnification: 1.1,
      }}
      style={listStyles.row}
      activeOpacity={0.1}
    >
      <View style={listStyles.rowContent}>
        <ListEventItem {...props} />
      </View>
    </TouchableHighlight>
  )
}

export default FeedListItem
