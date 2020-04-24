// @flow
import React, { createRef } from 'react'
import { Animated } from 'react-native'
import * as Animatable from 'react-native-animatable'
import { get } from 'lodash'
import { SwipeableFlatList } from 'react-native-swipeable-lists'
import GDStore from '../../lib/undux/GDStore'
import { withStyles } from '../../lib/styles'
import { useErrorDialog } from '../../lib/undux/utils/dialog'
import userStorage from '../../lib/gundb/UserStorage'
import type { FeedEvent } from '../../lib/gundb/UserStorageClass'
import goodWallet from '../../lib/wallet/GoodWallet'
import ScrollToTopButton from '../common/buttons/ScrollToTopButton'
import logger from '../../lib/logger/pino-logger'
import { CARD_OPEN, fireEvent } from '../../lib/analytics/analytics'
import FeedActions from './FeedActions'
import FeedListItem from './FeedItems/FeedListItem'

const log = logger.child({ from: 'ShareButton' })

const VIEWABILITY_CONFIG = {
  minimumViewTime: 3000,
  viewAreaCoveragePercentThreshold: 100,
  waitForInteraction: true,
}
const emptyFeed = { type: 'empty', data: {} }

const AnimatedSwipeableFlatList = Animated.createAnimatedComponent(SwipeableFlatList)

export type FeedListProps = {
  data: any,
  onEndReached: any,
  initialNumToRender: ?number,
  store: GDStore,
  handleFeedSelection: Function,
  horizontal: boolean,
  selectedFeed: ?string,
  styles: Object,
  onScroll: Function,
}

type ItemComponentProps = {
  item: any,
  separators: {
    highlight: any,
    unhighlight: any,
  },
  index: number,
}

const FeedList = ({
  data,
  handleFeedSelection,
  initialNumToRender,
  onEndReached,
  styles,
  onScroll,
  headerLarge,
}: FeedListProps) => {
  const [showErrorDialog] = useErrorDialog()
  const feeds = data && data instanceof Array && data.length ? data : [emptyFeed]
  const flRef = createRef()

  const scrollToTop = () => {
    if (get(flRef, 'current._component._flatListRef.scrollToOffset')) {
      flRef.current._component._flatListRef.scrollToOffset({ offset: 0 })
    }
  }

  const keyExtractor = item => item.id

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
      fireEvent(CARD_OPEN, { cardId: item.id })
      handleFeedSelection(item, true)
    }
  }

  const renderItemComponent = ({ item, separators, index }: ItemComponentProps) => (
    <FeedListItem key={item.id} item={item} separators={separators} fixedHeight onPress={pressItem(item, index + 1)} />
  )

  /**
   * Calls proper action depening on the feed status
   * @param {FeedEvent} item - feed item
   * @param {object} actions - wether to cancel/delete or any further action required
   */
  const handleFeedActionPress = ({ id, status }: FeedEvent, actions: {}) => {
    if (actions.canCancel) {
      if (status === 'pending') {
        // if status is 'pending' trying to cancel a tx that doesn't exist will fail and may confuse the user
        showErrorDialog("Current transaction is still pending, it can't be cancelled right now")
      } else {
        try {
          userStorage.cancelOTPLEvent(id)
          goodWallet.cancelOTLByTransactionHash(id).catch(e => {
            log.error('cancel payment failed - quick actions', e.message, e)
            userStorage.updateOTPLEventStatus(id, 'pending')
            showErrorDialog('The payment could not be canceled at this time', 'CANCEL-PAYMNET-1')
          })
        } catch (e) {
          log.error('cancel payment failed - quick actions', e.message, e)
          userStorage.updateOTPLEventStatus(id, 'pending')
          showErrorDialog('The payment could not be canceled at this time', 'CANCEL-PAYMNET-2')
        }
      }
    }

    if (actions.canDelete) {
      userStorage.deleteEvent(id).catch(e => log.error('delete event failed:', e.message, e))
    }
  }

  const renderQuickActions = ({ item }) => {
    const canCancel = item && item.displayType === 'sendpending'
    const canDelete = item && item.id && item.id.indexOf('0x') === -1 && feeds.length > 1
    const hasAction = canCancel || canDelete
    const actions = { canCancel, canDelete }
    const props = { item, hasAction }

    // returning null prevents swipe action
    if (!hasAction) {
      return null
    }

    return (
      <Animatable.View animation="fadeIn" delay={750}>
        <FeedActions
          onPress={hasAction && (() => handleFeedActionPress(item, actions))}
          actionIcon={actionIcon(actions)}
          {...props}
        >
          {actionLabel(actions)}
        </FeedActions>
      </Animatable.View>
    )
  }

  return (
    <>
      <AnimatedSwipeableFlatList
        bounceFirstRowOnMount={true}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollableView}
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
        onScroll={onScroll}
        ref={flRef}
      />
      {<ScrollToTopButton onPress={scrollToTop} show={headerLarge} />}
    </>
  )
}

const getStylesFromProps = ({ theme }) => ({
  scrollView: {
    display: 'flex',
    flexGrow: 1,
    height: 1,
  },
  scrollableView: {
    flexGrow: 1,
    display: 'flex',
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

const actionIcon = ({ canDelete, canCancel }) => {
  if (canCancel) {
    return 'close'
  }

  if (canDelete) {
    return 'trash'
  }

  return null
}

export default GDStore.withStore(withStyles(getStylesFromProps)(FeedList))
