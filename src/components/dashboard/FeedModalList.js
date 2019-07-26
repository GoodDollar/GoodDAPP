// @flow
import React, { createRef, useEffect } from 'react'
import { Dimensions, FlatList, View } from 'react-native'
import { Portal } from 'react-native-paper'
import normalize from '../../lib/utils/normalizeText'
import GDStore from '../../lib/undux/GDStore'
import { withStyles } from '../../lib/styles'
import FeedModalItem from './FeedItems/FeedModalItem'

const { width } = Dimensions.get('window')

const VIEWABILITY_CONFIG = {
  minimumViewTime: 3000,
  viewAreaCoveragePercentThreshold: 100,
  waitForInteraction: true,
}

const emptyFeed = { type: 'empty', data: {} }

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
  const flatListRef = createRef()

  useEffect(() => {
    const index = selectedFeed ? data.findIndex(item => item.id === selectedFeed.id) : 0
    setTimeout(() => {
      flatListRef &&
        flatListRef.current &&
        flatListRef.current.scrollToOffset({ animated: true, offset: width * index })
    }, 200)
  }, [selectedFeed, flatListRef])

  const getItemLayout = (_: any, index: number) => {
    const length = 200
    return { index, length, offset: length * index + 100 }
  }

  const renderItemComponent = ({ item, separators, index }: ItemComponentProps) => (
    <FeedModalItem item={item} separators={separators} fixedHeight onPress={() => handleFeedSelection(item, false)} />
  )

  const feeds = data && data instanceof Array && data.length ? data : undefined
  return (
    <Portal>
      <View style={styles.horizontalContainer}>
        <FlatList
          contentContainerStyle={styles.horizontalList}
          data={feeds && feeds.length ? feeds : [emptyFeed]}
          getItemLayout={getItemLayout}
          initialNumToRender={selectedFeed ? Math.abs(data.findIndex(item => item.id === selectedFeed.id)) : 1}
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
    width: '100%',
  },
  horizontalList: {
    width: '100%',
    maxWidth: '100vw',
    flex: 1,
  },
})

export default GDStore.withStore(withStyles(getStylesFromProps)(FeedModalList))
