// @flow
import React, { PureComponent } from 'react'
import {
  Animated,
  SwipeableFlatList,
  FlatList,
  View,
  StyleSheet,
  Dimensions,
  Text,
  ActivityIndicator
} from 'react-native'
import { normalize } from 'react-native-elements'
import FeedActions from './FeedActions'
import FeedListItem from './FeedItems/FeedListItem'
import FeedModalItem from './FeedItems/FeedModalItem'
import GDStore from '../../lib/undux/GDStore'
import pino from '../../lib/logger/pino-logger'
const log = pino.child({ from: 'FeedListView' })

const SCREEN_SIZE = {
  width: 200,
  height: 72
}

const VIEWABILITY_CONFIG = {
  minimumViewTime: 3000,
  viewAreaCoveragePercentThreshold: 100,
  waitForInteraction: true
}

const AnimatedFlatList = Animated.createAnimatedComponent(FlatList)
const AnimatedSwipeableFlatList = Animated.createAnimatedComponent(SwipeableFlatList)

const { height } = Dimensions.get('window')

export type FeedListProps = {
  fixedHeight: boolean,
  virtualized: boolean,
  data: any,
  updateData: any,
  onEndReached: any,
  initialNumToRender: ?number,
  store: GDStore,
  handleFeedSelection: Function,
  horizontal: boolean,
  selectedFeed: ?string
}

type FeedListState = {
  debug: boolean,
  inverted: boolean,
  filterText: '',
  logViewable: boolean
}

type ItemComponentProps = {
  item: any,
  separators: {
    highlight: any,
    unhighlight: any
  },
  index: number
}

type ItemSeparatorComponentProps = { highlighted: boolean }

class FeedList extends PureComponent<FeedListProps, FeedListState> {
  state = {
    debug: false,
    inverted: false,
    filterText: '',
    logViewable: false
  }

  componentDidUpdate(prevProps) {
    if (prevProps.selectedFeed !== this.props.selectedFeed) {
      const item = this.props.data.find(item => item.transactionHash === this.props.selectedFeed)
      this.scrollToItem(item)
    }
  }

  scrollToItem = item => {
    log.info('Scroll to item', { item })
    this.flatListRef && this.flatListRef.getNode().scrollToItem({ animated: true, item, viewPosition: 0.5 })
  }

  getItemLayout = (data: any, index: number) => {
    const [length, separator, header] = this.props.horizontal
      ? [SCREEN_SIZE.width, 0, 100]
      : [SCREEN_SIZE.height, StyleSheet.hairlineWidth, 30]
    return { index, length, offset: (length + separator) * index + header }
  }

  pressItem = (item, index: number) => () => {
    const { handleFeedSelection, horizontal } = this.props
    handleFeedSelection(item, !horizontal)
    this.scrollToItem(item)
  }

  flatListRef = null
  swipeableFlatListRef = null

  renderItemComponent = ({ item, separators, index }: ItemComponentProps) => {
    const { fixedHeight, horizontal } = this.props
    const itemProps = {
      item,
      separators,
      onPress: this.pressItem(item, index + 1),
      fixedHeight
    }
    return horizontal ? <FeedModalItem {...itemProps} /> : <FeedListItem {...itemProps} />
  }

  renderList = (feeds: any, loading: boolean) => {
    const { fixedHeight, onEndReached, initialNumToRender, horizontal } = this.props

    if (horizontal) {
      return (
        <View style={styles.horizontalContainer}>
          {loading ? <ActivityIndicator style={styles.loading} animating={true} color="gray" size="large" /> : null}
          <AnimatedFlatList
            initialNumToRender={5}
            ItemSeparatorComponent={ItemSeparatorComponent}
            data={feeds}
            getItemLayout={fixedHeight ? this.getItemLayout : undefined}
            horizontal={horizontal}
            key={(horizontal ? 'h' : 'v') + (fixedHeight ? 'f' : 'd')}
            keyboardShouldPersistTaps="always"
            keyboardDismissMode="on-drag"
            legacyImplementation={false}
            numColumns={1}
            pagingEnabled={true}
            onEndReached={onEndReached}
            ref={ref => (this.flatListRef = ref)}
            refreshing={false}
            renderItem={this.renderItemComponent}
            contentContainerStyle={styles.horizontalList}
            viewabilityConfig={VIEWABILITY_CONFIG}
          />
        </View>
      )
    } else {
      return (
        <View style={styles.verticalContainer}>
          {loading ? <ActivityIndicator style={styles.loading} animating={true} color="gray" size="large" /> : null}
          <AnimatedSwipeableFlatList
            bounceFirstRowOnMount={true}
            maxSwipeDistance={160}
            initialNumToRender={initialNumToRender || 10}
            ItemSeparatorComponent={ItemSeparatorComponent}
            data={feeds}
            getItemLayout={fixedHeight ? this.getItemLayout : undefined}
            horizontal={horizontal}
            key={(horizontal ? 'h' : 'v') + (fixedHeight ? 'f' : 'd')}
            keyboardShouldPersistTaps="always"
            keyboardDismissMode="on-drag"
            legacyImplementation={false}
            numColumns={1}
            onEndReached={onEndReached}
            ref={ref => (this.swipeableFlatListRef = ref)}
            refreshing={false}
            renderItem={this.renderItemComponent}
            contentContainerStyle={styles.verticalList}
            viewabilityConfig={VIEWABILITY_CONFIG}
            renderQuickActions={FeedActions}
          />
        </View>
      )
    }
  }

  render() {
    const { data } = this.props
    const feeds = data && data instanceof Array && data.length ? data : undefined
    const { loading } = this.props.store.get('currentScreen')
    return feeds ? (
      this.renderList(feeds, loading)
    ) : (
      <View style={styles.verticalContainer}>
        {loading ? (
          <ActivityIndicator animating={true} color="gray" size="large" />
        ) : (
          <Text style={{ textAlign: 'center' }}>Feed is empty.</Text>
        )}
      </View>
    )
  }
}

export class ItemSeparatorComponent extends PureComponent<ItemSeparatorComponentProps> {
  render() {
    const style = this.props.highlighted
      ? [styles.itemSeparator, { marginLeft: 0, backgroundColor: '#d9d9d9' }]
      : styles.itemSeparator
    return <View style={style} />
  }
}

const styles = StyleSheet.create({
  loading: {
    marginTop: normalize(10)
  },
  horizontalContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    flex: 1,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: normalize(10),
    paddingVertical: normalize(20),
    position: 'fixed',
    height
  },
  verticalContainer: {
    backgroundColor: '#efeff4',
    flex: 1,
    justifyContent: 'center'
  },
  verticalList: {
    backgroundColor: '#fff',
    width: '100%',
    maxWidth: '100vw'
  },
  horizontalList: {
    width: '100%',
    maxWidth: '100vw',
    flex: 1
  },
  options: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center'
  },
  searchRow: {
    paddingHorizontal: normalize(10)
  },
  itemSeparator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgb(200, 199, 204)'
  }
})

export default GDStore.withStore(FeedList)
