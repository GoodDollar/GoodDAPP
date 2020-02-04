// @flow
import React, { createRef, useEffect, useState } from 'react'
import { FlatList, View, Platform, Dimensions } from 'react-native'
import { isMobileOnly } from 'mobile-device-detect'
import { Portal } from 'react-native-paper'
import _once from 'lodash/once'
import { withStyles } from '../../lib/styles'
import { getMaxDeviceWidth, getScreenWidth } from '../../lib/utils/Orientation'
import { CARD_SLIDE, fireEvent } from '../../lib/analytics/analytics'
import FeedModalItem from './FeedItems/FeedModalItem'
const VIEWABILITY_CONFIG = {
  minimumViewTime: 3000,
  viewAreaCoveragePercentThreshold: 100,
  waitForInteraction: true,
}

const maxScreenWidth = getMaxDeviceWidth()
const emptyFeed = { type: 'empty', data: {} }

export type FeedModalListProps = {
  data: any,
  updateData: any,
  onEndReached: any,
  initialNumToRender: ?number,
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

  const getItemLayout = (_: any, index: number) => {
    const length = screenWidth
    return { index, length, offset: length * index }
  }

  const renderItemComponent = ({ item, separators, index }: ItemComponentProps) => (
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

  const slideEvent = _once(() => {
    fireEvent(CARD_SLIDE)
  })

  const feeds = data && data instanceof Array && data.length ? data : undefined
  return (
    <Portal>
      <View style={[styles.horizontalContainer, { opacity: loading ? 0 : 1 }]}>
        <FlatList
          style={styles.flatList}
          onScroll={({ nativeEvent }) => {
            slideEvent()

            // when nativeEvent contentOffset reaches target offset setLoading to false, we stopped scrolling
            if (Math.abs(offset - nativeEvent.contentOffset.x) < 5) {
              setLoading(false)
            }
          }}
          contentContainerStyle={[styles.horizontalList, !isMobileOnly && { justifyContent: 'center' }]}
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
  horizontalContainer: {
    backgroundColor: theme.modals.overlayBackgroundColor,
    flex: 1,
    top: 0,
    left: 0,
    padding: 0,

    // FIXME: RN
    position: Platform.select({
      web: 'fixed',
      default: 'absolute',
    }),

    // FIXME: RN
    height: Platform.select({
      web: '100vh',
      default: getScreenHeight(),
    }),
    width: '100%',
  },
  horizontalList: {
    width: '100%',

    // FIXME: RN
    maxWidth: Platform.select({
      web: '100vw',
      default: getScreenWidth(),
    }),
    flex: 1,
  },
  horizontalListItem: {
    width: maxScreenWidth,
  },
  flatList: {
    // FIXME: RN
    ...Platform.select({
      web: {
        transform: 'translateY(1px)',
      },
    }),
  },
})

export default withStyles(getStylesFromProps)(FeedModalList)
