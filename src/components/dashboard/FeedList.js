// @flow
import React, { PureComponent } from 'react'
import { Animated, SwipeableFlatList, FlatList, View, StyleSheet, Dimensions } from 'react-native'
import { normalize } from 'react-native-elements'
import FeedActions from './FeedActions'
import FeedListItem from './FeedItems/FeedListItem'
import FeedModalItem from './FeedItems/FeedModalItem'
import { ScrollView } from 'react-native-web'

const SCREEN_SIZE = {
  width: 200,
  height: 72
}

const VIEWABILITY_CONFIG = {
  minimumViewTime: 3000,
  viewAreaCoveragePercentThreshold: 100,
  waitForInteraction: true
}

const { height } = Dimensions.get('window')

export type FeedListProps = {
  title: string,
  fixedHeight: boolean,
  virtualized: boolean,
  data: any,
  getData: any,
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

type ItemSeparatorComponentProps = { highlighted: boolean }

class FeedList extends PureComponent<FeedListProps, FeedListState> {
  state = {
    debug: false,
    inverted: false,
    filterText: '',
    logViewable: false,
    horizontal: false
  }

  onChangeScrollToIndex = text => {
    this.listRef.getNode().scrollToIndex({ viewPosition: 0.5, index: Number(text) })
  }

  captureRef = ref => (this.listRef = ref)

  getItemLayout = (data: any, index: number) => {
    const [length, separator, header] = this.state.horizontal
      ? [SCREEN_SIZE.width, 0, 100]
      : [SCREEN_SIZE.height, StyleSheet.hairlineWidth, 30]
    return { index, length, offset: (length + separator) * index + header }
  }

  onViewableItemsChanged = (info: InfoType) => {
    // Impressions can be logged here
    if (this.state.logViewable) {
      console.log('onViewableItemsChanged: ', info.changed.map(v => ({ ...v, item: '...' })))
    }
  }

  pressItem = () => {
    this.setState(state => ({ horizontal: !state.horizontal }))
    // const node = this.listRef.getNode()
    // if (node) {
    //   this.listRef.getNode().recordInteraction()
    // }
  }

  scrollPos = new Animated.Value(0)

  scrollSinkX = Animated.event([{ nativeEvent: { contentOffset: { x: this.scrollPos } } }], { useNativeDriver: true })

  scrollSinkY = Animated.event([{ nativeEvent: { contentOffset: { y: this.scrollPos } } }], { useNativeDriver: true })

  // componentDidUpdate() {
  //   const node = this.listRef.getNode()
  //   if (node) {
  //     this.listRef.getNode().recordInteraction() // e.g. flipping logViewable switch
  //   }
  // }

  renderItemComponent = ({ item, separators }) => {
    const { fixedHeight } = this.props
    const { horizontal } = this.state
    const itemProps = {
      item,
      separators,
      onPress: this.pressItem,
      fixedHeight
    }

    return horizontal ? <FeedModalItem {...itemProps} /> : <FeedListItem {...itemProps} />
  }

  render() {
    const { data, virtualized, fixedHeight, onEndReached } = this.props
    const { inverted, horizontal } = this.state
    let viewStyles = horizontal ? styles.horizontalContainer : styles.verticalContainer
    let listStyles = horizontal ? styles.horizontalList : styles.verticalList

    const AnimatedFlatList = Animated.createAnimatedComponent(horizontal ? FlatList : SwipeableFlatList)

    return (
      <ScrollView style={viewStyles} horizontal={horizontal}>
        <AnimatedFlatList
          bounceFirstRowOnMount={true}
          maxSwipeDistance={160}
          initialNumToRender={5}
          ItemSeparatorComponent={ItemSeparatorComponent}
          data={data}
          disableVirtualization={!virtualized}
          getItemLayout={fixedHeight ? this.getItemLayout : undefined}
          horizontal={horizontal}
          inverted={inverted}
          key={(horizontal ? 'h' : 'v') + (fixedHeight ? 'f' : 'd')}
          keyboardShouldPersistTaps="always"
          keyboardDismissMode="on-drag"
          legacyImplementation={false}
          numColumns={1}
          onEndReached={onEndReached}
          onRefresh={() => {
            console.log('nothing to refresh')
          }}
          onScroll={horizontal ? this.scrollSinkX : this.scrollSinkY}
          onViewableItemsChanged={this.onViewableItemsChanged}
          ref={this.captureRef}
          refreshing={false}
          renderItem={this.renderItemComponent}
          contentContainerStyle={listStyles}
          viewabilityConfig={VIEWABILITY_CONFIG}
          renderQuickActions={FeedActions}
        />
      </ScrollView>
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
    maxWidth: '100vw'
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
