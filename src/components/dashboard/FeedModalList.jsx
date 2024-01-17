// @flow
import React, { useCallback, useMemo } from 'react'
import { FlatList, View } from 'react-native'
import { Portal } from 'react-native-paper'
import { withStyles } from '../../lib/styles'
import { FeedCategories } from '../../lib/userStorage/FeedCategory'
import { getMaxDeviceWidth } from '../../lib/utils/sizes'
import FeedModalItem from './FeedItems/FeedModalItem'
import { keyExtractor, useFeeds } from './utils/feed'

export type FeedModalListProps = {
  data: any,
  onEndReached: any,
  handleFeedSelection: Function,
  selectedFeed: ?string,
  styles: Object,
  navigation: any,
}

type ItemComponentProps = {
  item: any,
  separators: {
    highlight: any,
    unhighlight: any,
  },
  index: number,
}

const maxScreenWidth = getMaxDeviceWidth()

const getItemLayout = (_, index) => ({ index, length: maxScreenWidth, offset: maxScreenWidth * index })

const Item = React.memo(({ item, handleFeedSelection, navigation }) => {
  return (
    <View
      style={{
        width: maxScreenWidth,
      }}
    >
      <FeedModalItem navigation={navigation} item={item} onPress={() => handleFeedSelection(item, false)} />
    </View>
  )
})

const FeedModalList = ({
  data = [],
  onEndReached,
  handleFeedSelection,
  selectedFeed,
  styles,
  navigation,
}: FeedModalListProps) => {
  // Component is in loading state until matches the offset for the selected item
  // get feeds without invites and news
  const feeds = useFeeds(data, { invites: false, category: FeedCategories.Transactions })

  const selectedFeedIndex = useMemo(() => (selectedFeed ? feeds.findIndex(item => item.id === selectedFeed.id) : -1), [
    feeds,
    selectedFeed,
  ])

  /**
   * hack to fix https://github.com/necolas/react-native-web/issues/2030
   */
  const getFlatListRef = useCallback(
    flatList => {
      if (flatList && selectedFeedIndex >= 0) {
        flatList.scrollToIndex({ animated: false, index: selectedFeedIndex })
      }
    },
    [selectedFeedIndex],
  )

  const renderItemComponent = useCallback(
    ({ item }: ItemComponentProps) => {
      return <Item item={item} handleFeedSelection={handleFeedSelection} navigation={navigation} />
    },
    [handleFeedSelection, navigation],
  )

  return (
    <Portal>
      <View style={styles.horizontalContainer}>
        <FlatList
          keyExtractor={keyExtractor}
          style={styles.flatList}
          scrollEventThrottle={500}
          data={feeds}
          getItemLayout={getItemLayout}
          initialNumToRender={5}
          initialScrollIndex={selectedFeedIndex}
          onEndReached={onEndReached}
          ref={getFlatListRef}
          renderItem={renderItemComponent}
          horizontal
          pagingEnabled
        />
      </View>
    </Portal>
  )
}

const getStylesFromProps = ({ theme }) => ({
  horizontalContainer: {
    backgroundColor: theme.modals.overlayBackgroundColor,
    padding: 0,
    width: '100%',
  },
  horizontalListItem: {
    width: maxScreenWidth,
  },
  flatList: {
    transform: [{ translateY: 1 }], //Do not delete, this repairs horizontal feed scrolling
  },
})

export default withStyles(getStylesFromProps)(FeedModalList)
