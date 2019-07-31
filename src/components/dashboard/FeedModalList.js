// @flow
import React, { createRef, useEffect, useState } from 'react'
import { Dimensions, FlatList, View } from 'react-native'
import { Portal } from 'react-native-paper'
import { withStyles } from '../../lib/styles'
import { Indicator } from '../common/view/LoadingIndicator'
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
}: FeedModalListProps) => {
  const flatListRef = createRef()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const index = selectedFeed ? data.findIndex(item => item.id === selectedFeed.id) : 0
    setTimeout(() => {
      flatListRef &&
        flatListRef.current &&
        flatListRef.current.scrollToOffset({ animated: false, offset: width * index })
      setLoading(false)
    }, 200)
  }, [selectedFeed])

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
      <Indicator loading={loading} />
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
})

export default withStyles(getStylesFromProps)(FeedModalList)
