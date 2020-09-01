// @flow
import React, { createRef, useCallback, useEffect, useMemo, useState } from 'react'
import { FlatList, View } from 'react-native'
import { isMobileOnly } from 'mobile-device-detect'
import { Portal } from 'react-native-paper'
import { once } from 'lodash'
import { withStyles } from '../../lib/styles'
import { getMaxDeviceWidth, getScreenWidth } from '../../lib/utils/Orientation'
import { CARD_SLIDE, fireEvent } from '../../lib/analytics/analytics'
import FeedModalItem from './FeedItems/FeedModalItem'

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

const VIEWABILITY_CONFIG = {
  minimumViewTime: 3000,
  viewAreaCoveragePercentThreshold: 100,
  waitForInteraction: true,
}

const maxScreenWidth = getMaxDeviceWidth()
const emptyFeed = { type: 'empty', data: {} }

const slideEvent = once(() => {
  fireEvent(CARD_SLIDE)
})

const FeedModalList = ({
  data = [],
  onEndReached,
  handleFeedSelection,
  selectedFeed,
  styles,
  navigation,
}: FeedModalListProps) => {
  const flatListRef = createRef()

  // Component is in loading state until matches the offset for the selected item
  const [loading, setLoading] = useState(true)
  const [offset, setOffset] = useState()
  const screenWidth = getScreenWidth()

  // When screenWidth or selectedFeed changes needs to recalculate the offset
  useEffect(() => {
    const index = selectedFeed ? data.findIndex(item => item.id === selectedFeed.id) : 0
    setOffset(screenWidth * index)
  }, [screenWidth, selectedFeed])

  // When target offset changes (by the prev useEffect) scrollToOffset
  useEffect(() => {
    if (offset === undefined) {
      return
    }

    // If offset is 0 we don't need to scroll, just set to false
    if (offset <= 0) {
      setLoading(false)
    } else {
      // Fire scrollToOffset within a delay to ensure the action is executed.
      // https://stackoverflow.com/questions/40200660/react-native-scrollto-with-interactionmanager-not-working
      setTimeout(() => {
        flatListRef && flatListRef.current && flatListRef.current.scrollToOffset({ animated: false, offset })
      }, 0)
    }
  }, [offset, flatListRef])

  const getItemLayout = useCallback(
    (_: any, index: number) => {
      const length = screenWidth
      return { index, length, offset: length * index }
    },
    [screenWidth],
  )

  const renderItemComponent = useCallback(
    ({ item, separators }: ItemComponentProps) => (
      <View style={styles.horizontalListItem}>
        <FeedModalItem
          navigation={navigation}
          item={item}
          separators={separators}
          fixedHeight
          onPress={() => handleFeedSelection(item, false)}
        />
      </View>
    ),
    [handleFeedSelection, navigation],
  )

  const keyExtractor = useCallback(item => item.id || item.createdDate, [])

  const initialNumToRender = useMemo(() => Math.abs(data.findIndex(item => item.id === selectedFeed.id)), [
    selectedFeed,
    data,
  ])

  const handleScroll = useCallback(
    ({ nativeEvent }) => {
      slideEvent()

      // when nativeEvent contentOffset reaches target offset setLoading to false, we stopped scrolling
      if (Math.abs(offset - nativeEvent.contentOffset.x) < 5) {
        setLoading(false)
      }
    },
    [offset, setLoading],
  )

  const feeds = useMemo(() => (Array.isArray(data) && data.length ? data : [emptyFeed]), [data])

  return (
    <Portal>
      <View style={[styles.horizontalContainer, { opacity: loading ? 0 : 1 }]}>
        <FlatList
          key={selectedFeed.id || selectedFeed.createdDate}
          keyExtractor={keyExtractor}
          style={styles.flatList}
          onScroll={handleScroll}
          contentContainerStyle={[styles.horizontalList, !isMobileOnly && { justifyContent: 'center' }]}
          data={feeds}
          getItemLayout={getItemLayout}
          initialNumToRender={initialNumToRender}
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
  horizontalContainer: {
    backgroundColor: theme.modals.overlayBackgroundColor,
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
  horizontalListItem: {
    width: maxScreenWidth,
  },
  flatList: {
    // transform: 'translateY(1px)', //Do not delete, this repairs horizontal feed scrolling
    transform: [{ translateY: '1px' }], //Do not delete, this repairs horizontal feed scrolling
  },
})

export default withStyles(getStylesFromProps)(FeedModalList)
