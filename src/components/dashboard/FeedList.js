// @flow
import React, { useState } from 'react'
import { Animated, ScrollView, SwipeableFlatList, View } from 'react-native'
import GDStore from '../../lib/undux/GDStore'
import { withStyles } from '../../lib/styles'
import { useErrorDialog } from '../../lib/undux/utils/dialog'
import goodWallet from '../../lib/wallet/GoodWallet'
import FeedActions from './FeedActions'
import FeedListItem from './FeedItems/FeedListItem'

const VIEWABILITY_CONFIG = {
  minimumViewTime: 3000,
  viewAreaCoveragePercentThreshold: 100,
  waitForInteraction: true,
}
const emptyFeed = { type: 'empty', data: {} }
const AnimatedSwipeableFlatList = Animated.createAnimatedComponent(SwipeableFlatList)

export type FeedListProps = {
  data: any,
  updateData: any,
  onEndReached: any,
  initialNumToRender: ?number,
  store: GDStore,
  handleFeedSelection: Function,
  horizontal: boolean,
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

const FeedList = ({ data, handleFeedSelection, initialNumToRender, onEndReached, styles }: FeedListProps) => {
  //enable a demo showing how to mark an item that his action button delete/cancel has been pressed
  const activeActionDemo = false
  const [showErrorDialog] = useErrorDialog()
  const feeds = data && data instanceof Array && data.length ? data : [emptyFeed]
  const [activeItems, setActive] = useState({})
  const keyExtractor = (item, index) => item.id
  const getItemLayout = (_: any, index: number) => {
    const [length, separator, header] = [72, 1, 30]
    return {
      index,
      length,
      offset: (length + separator) * index + header,
    }
  }

  const pressItem = item => () => {
    if (item.type !== 'empty') {
      handleFeedSelection(item, true)
    }
  }

  const renderItemComponent = ({ item, separators, index }: ItemComponentProps) => (
    <FeedListItem
      key={item.id}
      item={item}
      actionActive={activeItems[item.id]}
      separators={separators}
      fixedHeight
      onPress={pressItem(item, index + 1)}
    />
  )

  /**
   * Calls proper action depening on the feed status
   * @param {string} transactionHash - feed item ID
   * @param {object} actions - wether to cancel/delete or any further action required
   */
  const handleFeedActionPress = (item, actions) => {
    const transactionHash = item.id
    if (actions.canCancel) {
      try {
        if (activeActionDemo) {
          activeItems[item.id] = true
          setActive(activeItems)
        }
        goodWallet
          .cancelOTLByTransactionHash(transactionHash)
          .catch(e => showErrorDialog('Canceling the payment link has failed', e))

        // activeItems[item.id] = false
        // setActive(activeItems)
      } catch (e) {
        showErrorDialog(e)
      }
    }

    // TODO: canDelete action
  }

  const renderQuickActions = ({ item }) => {
    const canCancel = item && item.displayType === 'sendpending'
    const canDelete = item && item.id && item.id.indexOf('0x') === -1
    const hasAction = canCancel || canDelete
    const actions = { canCancel, canDelete }
    const props = { item, hasAction }
    return (
      <FeedActions
        onPress={hasAction && (() => handleFeedActionPress(item, actions))}
        actionActive={activeItems[item.id]}
        {...props}
      >
        {actionLabel(actions)}
      </FeedActions>
    )
  }

  return (
    <ScrollView style={styles.scrollList} contentContainerStyle={styles.scrollableView}>
      <View style={styles.verticalContainer}>
        <AnimatedSwipeableFlatList
          bounceFirstRowOnMount={true}
          contentContainerStyle={styles.verticalList}
          data={feeds}
          getItemLayout={getItemLayout}
          initialNumToRender={initialNumToRender || 10}
          key="vf"
          keyExtractor={keyExtractor}
          keyboardDismissMode="on-drag"
          keyboardShouldPersistTaps="always"
          legacyImplementation={false}
          maxSwipeDistance={112}
          numColumns={1}
          onEndReached={onEndReached}
          refreshing={false}
          renderItem={renderItemComponent}
          renderQuickActions={renderQuickActions}
          viewabilityConfig={VIEWABILITY_CONFIG}
        />
      </View>
    </ScrollView>
  )
}

const getStylesFromProps = ({ theme }) => ({
  verticalContainer: {
    backgroundColor: '#efeff4',
    flex: 1,
    justifyContent: 'center',
  },
  verticalList: {
    maxWidth: '100vw',
    width: '100%',
  },
  scrollList: {
    display: 'flex',
    flexGrow: 1,
    height: 1,
  },
  scrollableView: {
    display: 'flex',
    flexGrow: 1,
    height: '100%',
  },
})

const actionLabel = ({ canDelete, canCancel }) => {
  if (canCancel) {
    return 'Cancel Payment Link'
  }

  if (canDelete) {
    return 'Delete'
  }

  return ''
}

export default GDStore.withStore(withStyles(getStylesFromProps)(FeedList))
