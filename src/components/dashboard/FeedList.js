// @flow
import React from 'react'
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
  const [showErrorDialog] = useErrorDialog()

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
    <FeedListItem item={item} separators={separators} fixedHeight onPress={pressItem(item, index + 1)} />
  )

  /**
   * Calls proper action depening on the feed status
   * @param {string} transactionHash - feed item ID
   * @param {object} action - wether to cancel/delete or any further action required
   */
  const handleFeedActionPress = async (transactionHash, action) => {
    if (action.canCancel) {
      try {
        await goodWallet.cancelOTLByTransactionHash(transactionHash)
      } catch (e) {
        showErrorDialog(e)
      }
    }

    // TODO: canDelete action
  }

  const renderQuickActions = ({ item }) => {
    const canDelete = item && item.id && item.id.indexOf('0x') === -1
    const canCancel = item && item.displayType === 'sendpending'

    return (
      <FeedActions item={item} onPress={handleFeedActionPress} canDelete={canDelete} canCancel={canCancel}>
        {actionLabel({ canDelete, canCancel })}
      </FeedActions>
    )
  }

  const feeds = data && data instanceof Array && data.length ? data : [emptyFeed]

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
