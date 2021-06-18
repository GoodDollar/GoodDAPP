// @flow
import React, { memo, useCallback, useEffect, useRef, useState } from 'react'
import { Animated } from 'react-native'
import { SwipeableFlatList } from 'react-native-swipeable-lists'
import * as Animatable from 'react-native-animatable'
import { get, isFunction, noop } from 'lodash'
import moment from 'moment'

import GDStore from '../../lib/undux/GDStore'
import { withStyles } from '../../lib/styles'
import { useErrorDialog } from '../../lib/undux/utils/dialog'
import userStorage from '../../lib/gundb/UserStorage'
import type { FeedEvent } from '../../lib/gundb/UserStorageClass'
import goodWallet from '../../lib/wallet/GoodWallet'
import ScrollToTopButton from '../common/buttons/ScrollToTopButton'
import logger from '../../lib/logger/pino-logger'
import { decorate, ExceptionCategory, ExceptionCode } from '../../lib/logger/exceptions'
import FeedListItem from './FeedItems/FeedListItem'
import FeedActions from './FeedActions'
import { keyExtractor, useFeeds, VIEWABILITY_CONFIG } from './utils/feed'

const log = logger.child({ from: 'ShareButton' })

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

const getItemLayout = (_: any, index: number) => {
  const [length, separator, header] = [72, 1, 30]

  return {
    index,
    length,
    offset: (length + separator) * index + header,
  }
}

const Item = memo(({ item, handleFeedSelection }) => {
  return <FeedListItem key={keyExtractor(item)} item={item} handleFeedSelection={handleFeedSelection} />
})

const FeedList = ({
  data,
  handleFeedSelection,
  initialNumToRender,
  onEndReached,
  onEndReachedThreshold,
  onScrollEnd: _onScrollEnd = noop,
  styles,
  onScroll = noop,
  headerLarge,
  windowSize,
}: FeedListProps) => {
  const [showErrorDialog] = useErrorDialog()
  const flRef = useRef()
  const canceledFeeds = useRef([])
  const [showBounce, setShowBounce] = useState(true)
  const [displayContent, setDisplayContent] = useState(false)
  const [ableItemSelection, setAbleItemSelection] = useState(true)

  const feeds = useFeeds(data)

  const handleItemSelection = useCallback(
    (...args) => {
      if (ableItemSelection) {
        handleFeedSelection(...args)
      }
    },
    [ableItemSelection, handleFeedSelection],
  )

  const onScrollStart = useCallback(() => setAbleItemSelection(false), [setAbleItemSelection])

  const onScrollEnd = useCallback(() => setAbleItemSelection(true), [setAbleItemSelection])

  const scrollToTop = useCallback(() => {
    const list = get(flRef, 'current._component._flatListRef', {})

    if (isFunction(list.scrollToOffset)) {
      list.scrollToOffset({ offset: 0 })
    }
  }, [])

  const renderItemComponent = useCallback(
    ({ item }) => <Item item={item} handleFeedSelection={handleItemSelection} />,
    [handleItemSelection],
  )

  /**
   * Calls proper action depending on the feed status
   * @param {FeedEvent} item - feed item
   * @param {object} actions - wether to cancel/delete or any further action required
   */
  const handleFeedActionPress = useCallback(
    ({ id, status }: FeedEvent, actions: {}) => {
      if (!actions.canCancel) {
        // if status is 'pending' trying to cancel a tx that doesn't exist will fail and may confuse the user
        log.warn(
          "Current transaction is still pending, it can't be cancelled right now",
          'Pending - can`t be cancelled right now',
          new Error('Transaction is still pending'),
          {
            id,
            status,
            category: ExceptionCategory.Human,
            dialogShown: true,
          },
        )
        showErrorDialog("Current transaction is still pending, it can't be cancelled right now23123123")
      } else {
        if (canceledFeeds.current.includes(id)) {
          log.info('Already cancelled', id)
        } else {
          try {
            canceledFeeds.current.push(id)
            userStorage.cancelOTPLEvent(id)

            goodWallet.cancelOTLByTransactionHash(id).catch(e => {
              const uiMessage = decorate(e, ExceptionCode.E11) + `\nTransaction: ${id}`

              log.error('cancel payment failed - quick actions', e.message, e, {
                category: ExceptionCategory.Blockhain,
                dialogShown: true,
                id,
              })
              userStorage.updateOTPLEventStatus(id, 'pending')
              showErrorDialog(uiMessage, ExceptionCode.E11)
            })
          } catch (e) {
            const uiMessage = decorate(e, ExceptionCode.E13)

            log.error('cancel payment failed - quick actions', e.message, e, { dialogShown: true })
            canceledFeeds.current.pop()
            userStorage.updateOTPLEventStatus(id, 'pending')
            showErrorDialog(uiMessage, ExceptionCode.E13)
          }
        }
      }

      if (actions.canDelete) {
        userStorage.deleteEvent(id).catch(e => log.error('delete event failed:', e.message, e))
      }

      userStorage.userProperties.set('showQuickActionHint', false)
      setShowBounce(false)
    },
    [showErrorDialog, setShowBounce],
  )

  const renderQuickActions = useCallback(
    ({ item }) => {
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
        <Animatable.View animation="fadeIn" delay={750} style={styles.expandAction}>
          <FeedActions
            onPress={hasAction && (() => handleFeedActionPress(item, actions))}
            actionIcon={actionIcon(actions)}
            {...props}
          >
            {actionLabel(actions)}
          </FeedActions>
        </Animatable.View>
      )
    },
    [feeds],
  )

  const manageDisplayQuickActionHint = useCallback(async () => {
    // Could be string containing date to show quick action hint after - otherwise boolean
    const showQuickActionHintFlag = await userStorage.userProperties.get('showQuickActionHint')

    const _showBounce =
      typeof showQuickActionHintFlag === 'string'
        ? moment(showQuickActionHintFlag).isBefore(moment())
        : showQuickActionHintFlag

    setShowBounce(_showBounce)

    if (_showBounce) {
      await userStorage.userProperties.set(
        'showQuickActionHint',
        moment()
          .add(24, 'hours')
          .format(),
      )
    }
  }, [setShowBounce])

  useEffect(() => {
    manageDisplayQuickActionHint().finally(() => setDisplayContent(true))
  }, [])

  return displayContent ? (
    <>
      <AnimatedSwipeableFlatList
        bounceFirstRowOnMount={showBounce}
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
        onEndReachedThreshold={onEndReachedThreshold}
        onScrollBeginDrag={onScrollStart}
        onScrollEndDrag={onScrollEnd}
        onMomentumScrollEnd={_onScrollEnd}
        refreshing={false}
        renderItem={renderItemComponent}
        renderQuickActions={renderQuickActions}
        viewabilityConfig={VIEWABILITY_CONFIG}
        onScroll={onScroll}
        ref={flRef}
        windowSize={windowSize}
      />
      <ScrollToTopButton onPress={scrollToTop} show={headerLarge} />
    </>
  ) : null
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
  expandAction: { flex: 1 },
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
