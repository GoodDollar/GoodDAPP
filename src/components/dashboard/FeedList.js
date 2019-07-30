// @flow
import React from 'react'
import { Animated, ScrollView, SwipeableFlatList, View } from 'react-native'
import GDStore from '../../lib/undux/GDStore'
import { withStyles } from '../../lib/styles'
import FeedActions from './FeedActions'
import FeedListItem from './FeedItems/FeedListItem'

const VIEWABILITY_CONFIG = {
  minimumViewTime: 3000,
  viewAreaCoveragePercentThreshold: 100,
  waitForInteraction: true,
}

const emptyFeed = { type: 'empty', data: {} }

const AnimatedSwipeableFlatList = Animated.createAnimatedComponent(SwipeableFlatList)

export type FeedListProps = {
  data: any,
  updateData: any,
  onEndReached: any,
  initialNumToRender: ?number,
  store: GDStore,
  handleFeedSelection: Function,
  horizontal: boolean,
  selectedFeed: ?string,
  styles: Object,
}

type ItemComponentProps = {
  item: any,
  separators: {
    highlight: any,
    unhighlight: any,
  },
  index: number,
}

const FeedList = ({
  data,
  updateData,
  onEndReached,
  initialNumToRender,
  store,
  handleFeedSelection,
  horizontal,
  selectedFeed,
  styles,
}: FeedListProps) => {
  const getItemLayout = (_: any, index: number) => {
    const [length, separator, header] = [72, 1, 30]
    return {
      index,
      length,
      offset: (length + separator) * index + header,
    }
  }

  const pressItem = (item, index: number) => () => {
    if (item.type !== 'empty') {
      handleFeedSelection(item, true)
    }
  }

  const renderItemComponent = ({ item, separators, index }: ItemComponentProps) => (
    <FeedListItem item={item} separators={separators} fixedHeight onPress={pressItem(item, index + 1)} />
  )

  const renderQuickActions = ({ item }) => <FeedActions item={item} />

  const feeds = data && data instanceof Array && data.length ? data : undefined

  return (
    <ScrollView style={styles.scrollList} contentContainerStyle={styles.scrollableView}>
      <View style={styles.verticalContainer}>
        <AnimatedSwipeableFlatList
          bounceFirstRowOnMount={true}
          contentContainerStyle={styles.verticalList}
          data={feeds && feeds.length ? [...feeds] : [emptyFeed]}
          getItemLayout={getItemLayout}
          initialNumToRender={initialNumToRender || 10}
          key="vf"
          keyboardDismissMode="on-drag"
          keyboardShouldPersistTaps="always"
          legacyImplementation={false}
          maxSwipeDistance={160}
          numColumns={1}
          onEndReached={onEndReached}
          refreshing={false}
          renderItem={renderItemComponent}
          renderQuickActions={renderQuickActions}
          viewabilityConfig={VIEWABILITY_CONFIG}
        />
      </View>
    </ScrollView>
  )
}

const getStylesFromProps = ({ theme }) => ({
  verticalContainer: {
    backgroundColor: '#efeff4',
    flex: 1,
    justifyContent: 'center',
  },
  verticalList: {
    width: '100%',
    maxWidth: '100vw',
  },
  scrollList: {
    marginTop: theme.sizes.default,
    display: 'flex',
    flexGrow: 1,
    height: 1,
  },
  scrollableView: {
    flexGrow: 1,
    display: 'flex',
    height: '100%',
  },
})

export default GDStore.withStore(withStyles(getStylesFromProps)(FeedList))
