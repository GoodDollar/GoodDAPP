// @flow
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { FlatList, View } from 'react-native'
import { isMobileOnly } from 'mobile-device-detect'
import { Portal } from 'react-native-paper'
import { once } from 'lodash'
import { withStyles } from '../../lib/styles'
import { getScreenWidth } from '../../lib/utils/orientation'
import { getMaxDeviceWidth } from '../../lib/utils/sizes'
import { CARD_SLIDE, fireEvent } from '../../lib/analytics/analytics'
import FeedModalItem from './FeedItems/FeedModalItem'
import { keyExtractor, useFeeds, VIEWABILITY_CONFIG } from './utils/feed'

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

const screenWidth = Number(getScreenWidth())
const maxScreenWidth = getMaxDeviceWidth()

const getItemLayout = (_, index) => ({ index, length: screenWidth, offset: screenWidth * index })

const FeedModalList = ({
  data = [],
  onEndReached,
  handleFeedSelection,
  selectedFeed,
  styles,
  navigation,
}: FeedModalListProps) => {
  const flatListRef = useRef()

  // Component is in loading state until matches the offset for the selected item
  const [loading, setLoading] = useState(true)
  const [offset, setOffset] = useState()

  const selectedFeedIndex = useMemo(() => (selectedFeed ? data.findIndex(item => item.id === selectedFeed.id) : -1), [
    data,
    selectedFeed,
  ])

  // When screenWidth or selectedFeed changes needs to recalculate the offset
  useEffect(() => {
    if (selectedFeedIndex < 0) {
      return
    }

    setOffset(screenWidth * selectedFeedIndex)
  }, [selectedFeedIndex])

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
        setLoading(false)
      }, 0)
    }
  }, [offset, flatListRef, setLoading])

  const renderItemComponent = useCallback(
    ({ item, separators }: ItemComponentProps) => {
      if (item.type === 'invite') {
        return
      }
      return (
        <View style={styles.horizontalListItem}>
          <FeedModalItem
            navigation={navigation}
            item={item}
            separators={separators}
            fixedHeight
            onPress={() => handleFeedSelection(item, false)}
          />
        </View>
      )
    },
    [handleFeedSelection, navigation],
  )

  const initialNumToRender = useMemo(() => Math.abs(selectedFeedIndex), [selectedFeedIndex])
  const slideEventRef = useRef(once(() => fireEvent(CARD_SLIDE)))

  const handleScroll = useCallback(
    ({ nativeEvent }) => {
      slideEventRef.current()

      // when nativeEvent contentOffset reaches target offset setLoading to false, we stopped scrolling
      if (Math.abs(offset - nativeEvent.contentOffset.x) < 5) {
        setLoading(false)
      }
    },
    [offset, setLoading],
  )

  const feeds = useFeeds(data)

  return (
    <Portal>
      <View style={[styles.horizontalContainer, { opacity: loading ? 0 : 1 }]}>
        <FlatList
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
