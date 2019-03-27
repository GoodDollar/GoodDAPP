// @flow
import React, { PureComponent } from 'react'
import { Animated, FlatList, View, StyleSheet } from 'react-native'
import { normalize } from 'react-native-elements'
import EventHorizontalListItem from '../common/EventHorizontalListItem'

const AnimatedFlatList = Animated.createAnimatedComponent(FlatList)

const VIEWABILITY_CONFIG = {
  minimumViewTime: 3000,
  viewAreaCoveragePercentThreshold: 100,
  waitForInteraction: true
}

export type ListSliderProps = {
  title: string,
  fixedHeight: boolean,
  virtualized: boolean,
  data: any,
  getData: any,
  updateData: any,
  onEndReached: any
}

type ListSliderState = {
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

class ListSlider extends PureComponent<ListSliderProps, ListSliderState> {
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
    const [length, separator, header] = this.state.horizontal ? [200, 0, 100] : [72, StyleSheet.hairlineWidth, 30]
    return { length, offset: (length + separator) * index + header, index }
  }

  onViewableItemsChanged = (info: InfoType) => {
    // Impressions can be logged here
    if (this.state.logViewable) {
      console.log('onViewableItemsChanged: ', info.changed.map(v => ({ ...v, item: '...' })))
    }
  }

  pressItem = (key: string) => {
    this.setState(state => ({ horizontal: !state.horizontal }))
    this.listRef.getNode().recordInteraction()
  }

  scrollPos = new Animated.Value(0)

  scrollSinkX = Animated.event([{ nativeEvent: { contentOffset: { x: this.scrollPos } } }], { useNativeDriver: true })

  scrollSinkY = Animated.event([{ nativeEvent: { contentOffset: { y: this.scrollPos } } }], { useNativeDriver: true })

  componentDidUpdate() {
    this.listRef.getNode().recordInteraction() // e.g. flipping logViewable switch
  }

  renderItemComponent = ({ item, separators }) => {
    const { fixedHeight } = this.props
    const { horizontal } = this.state
    return (
      <EventHorizontalListItem
        item={item}
        horizontal={horizontal}
        fixedHeight={fixedHeight}
        onPress={this.pressItem}
        onShowUnderlay={separators.highlight}
        onHideUnderlay={separators.unhighlight}
      />
    )
  }

  render() {
    const { data, virtualized, fixedHeight, onEndReached } = this.props
    const { inverted, horizontal } = this.state
    return (
      <View style={styles.container}>
        <AnimatedFlatList
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
          contentContainerStyle={styles.list}
          viewabilityConfig={VIEWABILITY_CONFIG}
        />
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
  container: {
    backgroundColor: '#efeff4',
    flex: 1
  },
  list: {
    backgroundColor: '#fff'
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
    backgroundColor: 'rgb(200, 199, 204)',
    marginLeft: 60
  }
})

export default ListSlider
