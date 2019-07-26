// @flow
import React, { useEffect, useRef } from 'react'
import { ActivityIndicator, Animated, FlatList, View } from 'react-native'
import { Portal } from 'react-native-paper'
import normalize from '../../lib/utils/normalizeText'
import GDStore from '../../lib/undux/GDStore'
import { withStyles } from '../../lib/styles'
import FeedModalItem from './FeedItems/FeedModalItem'

const VIEWABILITY_CONFIG = {
  minimumViewTime: 3000,
  viewAreaCoveragePercentThreshold: 100,
  waitForInteraction: true,
}

const emptyFeed = { type: 'empty', data: {} }

const AnimatedFlatList = Animated.createAnimatedComponent(FlatList)

export type FeedModalListProps = {
  data: any,
  updateData: any,
  onEndReached: any,
  initialNumToRender: ?number,
  store: GDStore,
  handleFeedSelection: Function,
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

const FeedModalList = ({
  data,
  updateData,
  onEndReached,
  initialNumToRender,
  store,
  handleFeedSelection,
  selectedFeed,
  styles,
}: FeedModalListProps) => {
  const flatListRef: AnimatedFlatList = useRef(null)

  useEffect(() => {
    const item = data.find(item => item.id === selectedFeed.id)
    const index = data.findIndex(item => item.id === selectedFeed.id)
    scrollToItem(item, index)
  }, [selectedFeed, flatListRef])

  const scrollToItem = (item: any, index: number) => {
    // eslint-disable-next-line no-console
    console.log('Reference', {
      item,
      flatListRef,
      index,
      selectedFeed,
    })

    // flatListRef && flatListRef.current && flatListRef.current.scrollToItem({ animated: true, item, viewPosition: 0.5 })
    flatListRef &&
      flatListRef.current &&
      flatListRef.current.scrollToIndex({ animated: true, index, viewPosition: 0.5 })
  }

  const getItemLayout = (_: any, index: number) => {
    const [length, separator, header] = [200, 0, 100]
    return {
      index,
      length,
      offset: (length + separator) * index + header,
    }
  }

  const renderItemComponent = ({ item, separators, index }: ItemComponentProps) => (
    <FeedModalItem item={item} separators={separators} fixedHeight onPress={() => handleFeedSelection(item, false)} />
  )

  const feeds = data && data instanceof Array && data.length ? data : undefined
  const loading = store.get('feedLoading')

  return (
    <Portal>
      <View style={styles.horizontalContainer}>
        {loading ? <ActivityIndicator style={styles.loading} animating={true} color="gray" size="large" /> : null}
        <AnimatedFlatList
          contentContainerStyle={styles.horizontalList}
          data={feeds && feeds.length ? feeds : [emptyFeed]}
          getItemLayout={getItemLayout}
          initialNumToRender={5}
          key="hf"
          keyboardDismissMode="on-drag"
          keyboardShouldPersistTaps="always"
          legacyImplementation={false}
          numColumns={1}
          onEndReached={onEndReached}
          ref={flatListRef}
          refreshing={false}
          renderItem={renderItemComponent}
          viewabilityConfig={VIEWABILITY_CONFIG}
          horizontal
          pagingEnabled
        />
      </View>
    </Portal>
  )
}

const getStylesFromProps = ({ theme }) => ({
  loading: {
    marginTop: normalize(8),
  },
  horizontalContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    flex: 1,
    top: 0,
    left: 0,
    padding: 0,
    position: 'fixed',
    height: '100vh',
  },
  horizontalList: {
    width: '100%',
    maxWidth: '100vw',
    flex: 1,
  },
})

export default GDStore.withStore(withStyles(getStylesFromProps)(FeedModalList))
