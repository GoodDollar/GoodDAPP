// @flow
import React, { PureComponent } from 'react'
import { Animated, SwipeableFlatList, FlatList, View, StyleSheet, Dimensions } from 'react-native'
import { normalize } from 'react-native-elements'
import FeedActions from './FeedActions'
import FeedListItem from './FeedItems/FeedListItem'
import FeedModalItem from './FeedItems/FeedModalItem'
// import { ScrollView } from 'react-native-web'

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

let AnimatedFlatList = Animated.createAnimatedComponent(SwipeableFlatList)

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

type ItemComponentProps = {
  item: any,
  separators: {
    highlight: any,
    unhighlight: any
  }
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

  componentDidMount() {
    this.listRef = AnimatedFlatList
  }

  captureRef = (ref: any) => {
    this.listRef = ref
  }

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
  }

  listRef = AnimatedFlatList

  scrollPos = new Animated.Value(0)

  scrollSinkX = Animated.event([{ nativeEvent: { contentOffset: { x: this.scrollPos } } }], { useNativeDriver: true })

  scrollSinkY = Animated.event([{ nativeEvent: { contentOffset: { y: this.scrollPos } } }], { useNativeDriver: true })

  renderItemComponent = ({ item, separators }: ItemComponentProps) => {
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

    AnimatedFlatList = Animated.createAnimatedComponent(horizontal ? FlatList : SwipeableFlatList)

    console.log({ data })
    const feeds =
      data && data instanceof Array && data.length
        ? data
        : [
            {
              id: 'abcd1234',
              date: new Date().getTime(),
              type: 'withdraw',
              data: {
                endpoint: {
                  address: 'sender',
                  fullName: 'Misao Matimbo',
                  avatar:
                    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAkCAIAAAB0Xu9BAAAABGdBTUEAALGPC/xhBQAAAuNJREFUWEetmD1WHDEQhDdxRMYlnBFyBIccgdQhKVcgJeQMpE5JSTd2uqnvIGpVUqmm9TPrffD0eLMzUn+qVnXPwiFd/PP6eLh47v7EaazbmxsOxjhTT88z9hV7GoNF1cUCvN7TTPv/gf/+uQPm862MWTL6fff4HfDx4S79/oVAlAUwqOmYR0rnazuFnhfOy/ErMKkcBFOr1vOjUi2MFn4nuMil6OPh5eGANLhW3y6u3aH7ijEDCxgCvzFmimvc95TekZLyMSeJC68Bkw0kqUy1K87FlpGZqsGFCyqEtQNDdFUtFctTiuhnPKNysid/WFEFLE2O102XJdEE+8IgeuGsjeJyGHm/xHvQ3JtKVsGGp85g9rK6xMHtvHO9+WACYjk5vkVM6XQ6OZubCJvTfPicYPeHO2AKFl5NuF5UK1VDUbeLxh2BcRGKTQE3irHm3+vPj6cfCod50Eqv5QxtwBQUGhZhbrGVuRia1B4MNp6edwBxld2sl1splfHCwfsvCZfrCQyWmX10djjOlWJSSy3VQlS6LmfrgNvaieRWx1LZ6s9co+P0DLsy3OdLU3lWRclQsVcHJBcUQ0k9/WVVrmpRzYQzpgAdQcAXxZzUnFX3proannrYH+Vq6KkLi+UkarH09mC8YPr2RMWOlEqFkQClsykGEv7CqCUbXcG8+SaGvJ4a8d4y6epND+pEhxoN0vWUu5ntXlFb5/JT7JfJJqoTdy9u9qc7ax3xJRHqJLADWEl23cFWl4K9fvoaCJ2BHpmJ3s3z+O0U/DmzdMjB9alWZtg4e3yxzPa7lUR7nkvxLHO9+tvJX3mtSDpwX8GajB283I8R8a7D2MhUZr1iNWdny256yYLd52DwRYBtRMvE7rsmtxIUE+zLKQCDO4jlxB6CZ8M17GhuY+XTE8vNhQiIiSE82ZsGwk1pht4ZSpT0YVpon6EvevOXXH8JxVR78QzNuamupW/7UB7wO/+7sG5V4ekXb4cL5Lyv+4IAAAAASUVORK5CYII='
                },
                amount: 30,
                message: 'For the pizza'
              }
            }
          ]

    return (
      <View style={viewStyles} horizontal={horizontal}>
        <AnimatedFlatList
          bounceFirstRowOnMount={true}
          maxSwipeDistance={160}
          initialNumToRender={5}
          ItemSeparatorComponent={ItemSeparatorComponent}
          data={feeds}
          debug
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
