// @flow
import React, { createRef, useCallback, useEffect, useRef, useState } from 'react'
import { Animated, SwipeableFlatList } from 'react-native'
import * as Animatable from 'react-native-animatable'
import { get } from 'lodash'
import moment from 'moment'
import GDStore from '../../lib/undux/GDStore'
import { withStyles } from '../../lib/styles'
import { useErrorDialog } from '../../lib/undux/utils/dialog'
import userStorage from '../../lib/gundb/UserStorage'
import type { FeedEvent } from '../../lib/gundb/UserStorageClass'
import goodWallet from '../../lib/wallet/GoodWallet'
import ScrollToTopButton from '../common/buttons/ScrollToTopButton'
import logger, { ExceptionCategory } from '../../lib/logger/pino-logger'
import { CARD_OPEN, fireEvent } from '../../lib/analytics/analytics'
import FeedActions from './FeedActions'
import FeedListItem from './FeedItems/FeedListItem'

const log = logger.child({ from: 'ShareButton' })

const VIEWABILITY_CONFIG = {
  minimumViewTime: 3000,
  viewAreaCoveragePercentThreshold: 100,
  waitForInteraction: true,
}
const emptyFeed = { type: 'empty', data: {}, id: 'empty' }
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
  onEndReachedThreshold,
  styles,
  onScroll,
  headerLarge,
  windowSize,
}: FeedListProps) => {
  const [showErrorDialog] = useErrorDialog()
  const feeds = data && data instanceof Array && data.length ? data : [emptyFeed]
  const flRef = createRef()
  const canceledFeeds = useRef([])
  const [showBounce, setShowBounce] = useState(true)
  const [displayContent, setDisplayContent] = useState(false)

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
  const handleFeedActionPress = useCallback(
    ({ id, status }: FeedEvent, actions: {}) => {
      if (actions.canCancel) {
        if (status === 'pending') {
          // if status is 'pending' trying to cancel a tx that doesn't exist will fail and may confuse the user
          log.error(
            "Current transaction is still pending, it can't be cancelled right now",
            'Pending - can`t be cancelled right now',
            null,
            {
              id,
              status,
              category: ExceptionCategory.Human,
              dialogShown: true,
            }
          )
          showErrorDialog("Current transaction is still pending, it can't be cancelled right now")
        } else if (canceledFeeds.current.includes(id)) {
          log.info('Already cancelled', id)
        } else {
          try {
            canceledFeeds.current.push(id)
            userStorage.cancelOTPLEvent(id)
            goodWallet.cancelOTLByTransactionHash(id).catch(e => {
              log.error('cancel payment failed - quick actions', e.message, e, {
                category: ExceptionCategory.Blockhain,
                dialogShown: true,
              })
              userStorage.updateOTPLEventStatus(id, 'pending')
              showErrorDialog('The payment could not be canceled at this time', 'CANCEL-PAYMNET-1')
            })
          } catch (e) {
            log.error('cancel payment failed - quick actions', e.message, e, { dialogShown: true })
            canceledFeeds.current.pop()
            userStorage.updateOTPLEventStatus(id, 'pending')
            showErrorDialog('The payment could not be canceled at this time', 'CANCEL-PAYMNET-2')
          }
        }
      }

      if (actions.canDelete) {
        userStorage.deleteEvent(id).catch(e => log.error('delete event failed:', e.message, e))
      }

      userStorage.userProperties.set('showQuickActionHint', false)
      setShowBounce(false)
    },
    [showErrorDialog, setShowBounce]
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
    },
    [feeds]
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
      userStorage.userProperties.set(
        'showQuickActionHint',
        moment()
          .add(24, 'hours')
          .format()
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
        refreshing={false}
        renderItem={renderItemComponent}
        renderQuickActions={renderQuickActions}
        viewabilityConfig={VIEWABILITY_CONFIG}
        onScroll={onScroll}
        ref={flRef}
        windowSize={windowSize}
      />
      {headerLarge ? null : <ScrollToTopButton onPress={scrollToTop} />}
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
