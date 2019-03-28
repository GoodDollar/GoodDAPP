import React from 'react'
import { SwipeableFlatList } from 'react-native-web'

import FeedItem from './FeedItem'
import FeedActions from './FeedActions'

const FeedList = ({ feeds }) => {
  return (
    <SwipeableFlatList
      data={feeds}
      bounceFirstRowOnMount={true}
      maxSwipeDistance={160}
      initialNumToRender={5}
      renderItem={FeedItem}
      renderQuickActions={FeedActions}
    />
  )
}

export default FeedList
