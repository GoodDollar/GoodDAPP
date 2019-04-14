// @flow
import React, { PureComponent } from 'react'
import { Animated, SwipeableFlatList, FlatList, View, StyleSheet, Dimensions, Text } from 'react-native'
import { normalize } from 'react-native-elements'
import FeedActions from './FeedActions'
import FeedListItem from './FeedItems/FeedListItem'
import FeedModalItem from './FeedItems/FeedModalItem'

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
  onEndReached: any
}

type FeedListState = {
  debug: boolean,
  inverted: boolean,
  filterText: '',
  logViewable: boolean,
  horizontal: boolean
}

type InfoType = {
  changed: Array<{
    key: string,
    isViewable: boolean,
    item: any,
    index: ?number,
    section?: any
  }>
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
    logViewable: false,
    horizontal: false
  }

  getItemLayout = (data: any, index: number) => {
    const [length, separator, header] = this.state.horizontal
      ? [SCREEN_SIZE.width, 0, 100]
      : [SCREEN_SIZE.height, StyleSheet.hairlineWidth, 30]
    return { index, length, offset: (length + separator) * index + header }
  }

  pressItem = (item, index: number) => () => {
    console.log(index)
    this.setState(
      state => ({ horizontal: !state.horizontal }),
      () => {
        this.flatListRef &&
          // this.flatListRef.getNode().scrollToIndex({ animated: true, index: Number(index), viewPosition: 0.5 })
          this.flatListRef.getNode().scrollToItem({ animated: true, item, viewPosition: 0.5 })
      }
    )
  }

  flatListRef = null
  swipeableFlatListRef = null

  renderItemComponent = ({ item, separators, index }: ItemComponentProps) => {
    const { fixedHeight } = this.props
    const { horizontal } = this.state
    const itemProps = {
      item,
      separators,
      onPress: this.pressItem(item, index + 1),
      fixedHeight
    }

    return horizontal ? <FeedModalItem {...itemProps} /> : <FeedListItem {...itemProps} />
  }

  renderList = (feeds: any) => {
    const { fixedHeight, onEndReached } = this.props
    const { horizontal } = this.state
    if (horizontal) {
      return (
        <View style={styles.horizontalContainer}>
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
          <AnimatedSwipeableFlatList
            bounceFirstRowOnMount={true}
            maxSwipeDistance={160}
            initialNumToRender={10}
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

    return feeds ? (
      this.renderList(feeds)
    ) : (
      <View style={styles.verticalContainer}>
        <Text style={{ textAlign: 'center' }}>Feed is empty.</Text>
      </View>
    )
  }
}

class ItemSeparatorComponent extends PureComponent<ItemSeparatorComponentProps> {
  render() {
    const style = this.props.highlighted
      ? [styles.itemSeparator, { marginLeft: 0, backgroundColor: '#d9d9d9' }]
      : styles.itemSeparator
    return <View style={style} />
  }
}

const styles = StyleSheet.create({
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
    flex: 1
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

export default FeedList
