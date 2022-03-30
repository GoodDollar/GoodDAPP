// @flow
import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { Animated, Dimensions, Easing, Linking, Platform, TouchableOpacity, View } from 'react-native'
import { concat, debounce, get, noop, uniqBy } from 'lodash'
import Mutex from 'await-mutex'
import type { Store } from 'undux'

import { t } from '@lingui/macro'
import AsyncStorage from '../../lib/utils/asyncStorage'
import normalize, { normalizeByLength } from '../../lib/utils/normalizeText'
import GDStore from '../../lib/undux/GDStore'
import SimpleStore, { assertStore } from '../../lib/undux/SimpleStore'
import { useDialog, useErrorDialog } from '../../lib/undux/utils/dialog'
import { PAGE_SIZE } from '../../lib/undux/utils/feed'
import { weiToGd, weiToMask } from '../../lib/wallet/utils'
import { initBGFetch } from '../../lib/notifications/backgroundFetch'
import { formatWithAbbreviations, formatWithFixedValueDigits } from '../../lib/utils/formatNumber'
import { fireEvent, GOTO_TAB_FEED, INVITE_BANNER, SCROLL_FEED } from '../../lib/analytics/analytics'
import Config from '../../config/config'

import { createStackNavigator } from '../appNavigation/stackNavigation'
import { initTransferEvents } from '../../lib/undux/utils/account'

import userStorage from '../../lib/userStorage/UserStorage'
import useAppState from '../../lib/hooks/useAppState'
import useGoodDollarPrice from '../reserve/useGoodDollarPrice'
import { PushButton } from '../appNavigation/PushButton'
import { useNativeDriverForAnimation } from '../../lib/utils/platform'
import TabsView from '../appNavigation/TabsView'
import BigGoodDollar from '../common/view/BigGoodDollar'
import ClaimButton from '../common/buttons/ClaimButton'
import TabButton from '../common/buttons/TabButton'
import Section from '../common/layout/Section'
import Wrapper from '../common/layout/Wrapper'
import logger from '../../lib/logger/js-logger'
import { Statistics, Support } from '../webView/webViewInstances'
import { withStyles } from '../../lib/styles'
import Mnemonics from '../signin/Mnemonics'
import useDeleteAccountDialog from '../../lib/hooks/useDeleteAccountDialog'
import { getMaxDeviceWidth, measure } from '../../lib/utils/sizes'
import { theme as _theme } from '../theme/styles'
import useOnPress from '../../lib/hooks/useOnPress'
import Invite from '../invite/Invite'
import Avatar from '../common/view/Avatar'
import _debounce from '../../lib/utils/debounce'
import useProfile from '../../lib/userStorage/useProfile'
import { GlobalTogglesContext } from '../../lib/contexts/togglesContext'
import Separator from '../common/layout/Separator'
import { useInviteCode } from '../invite/useInvites'
import { FeedCategories } from '../../lib/userStorage/FeedCategory'
import PrivacyPolicyAndTerms from './PrivacyPolicyAndTerms'
import Amount from './Amount'
import Claim from './Claim'
import FeedList from './FeedList'
import FeedModalList from './FeedModalList'
import OutOfGasError from './OutOfGasError'
import Reason from './Reason'
import Receive from './Receive'
import HandlePaymentLink from './HandlePaymentLink'

// import MagicLinkInfo from './MagicLinkInfo'
import Who from './Who'
import ReceiveSummary from './ReceiveSummary'
import ReceiveToAddress from './ReceiveToAddress'
import TransactionConfirmation from './TransactionConfirmation'
import SendToAddress from './SendToAddress'
import SendByQR from './SendByQR'
import SendLinkSummary from './SendLinkSummary'
import { ACTION_SEND } from './utils/sendReceiveFlow'

import FaceVerification from './FaceVerification/screens/VerificationScreen'
import FaceVerificationIntro from './FaceVerification/screens/IntroScreen'
import FaceVerificationError from './FaceVerification/screens/ErrorScreen'

import GoodMarketButton from './GoodMarket/components/GoodMarketButton'
import CryptoLiteracyBanner from './FeedItems/CryptoLiteracyDecemberBanner'
import GoodDollarPriceInfo from './GoodDollarPriceInfo/GoodDollarPriceInfo'

const log = logger.child({ from: 'Dashboard' })

let didRender = false
const screenWidth = getMaxDeviceWidth()
const initialHeaderContentWidth = screenWidth - _theme.sizes.default * 2 * 2
const initialAvatarLeftPosition = -initialHeaderContentWidth / 2 + 34
const { isCryptoLiteracy } = Config

export type DashboardProps = {
  navigation: any,
  screenProps: any,
  store: Store,
  styles?: any,
}

const feedMutex = new Mutex()

const abbreviateBalance = _balance => formatWithAbbreviations(weiToGd(_balance), 2)

const FeedTab = ({ setActiveTab, getFeedPage, activeTab, tab }) => {
  const onTabPress = useCallback(() => {
    log.debug('feed category selected', { tab })

    fireEvent(GOTO_TAB_FEED, { name: tab })
    setActiveTab(tab)
    getFeedPage(true, tab)
  }, [setActiveTab, getFeedPage, tab])

  const isAll = tab === FeedCategories.All
  const isTransactions = tab === FeedCategories.Transactions

  return (
    <TabButton
      onPress={onTabPress}
      isActive={tab === activeTab}
      hasLeftBorder={!isAll}
      flex={isTransactions ? 2 : 1}
      roundnessLeft={isAll ? 5 : 0}
      roundnessRight={isTransactions ? 5 : 0}
    >
      {FeedCategories.label(tab)}
    </TabButton>
  )
}

const Dashboard = props => {
  const balanceRef = useRef()
  const feedRef = useRef([])
  const resizeSubscriptionRef = useRef()
  const { screenProps, styles, theme, navigation }: DashboardProps = props
  const [balanceBlockWidth, setBalanceBlockWidth] = useState(70)
  const [headerContentWidth, setHeaderContentWidth] = useState(initialHeaderContentWidth)
  const [headerHeightAnimValue] = useState(new Animated.Value(176))
  const [headerAvatarAnimValue] = useState(new Animated.Value(68))
  const [headerAvatarLeftAnimValue] = useState(new Animated.Value(0))
  const [headerBalanceBottomAnimValue] = useState(new Animated.Value(0))
  const [avatarCenteredPosition, setAvatarCenteredPosition] = useState(0)
  const [headerBalanceRightMarginAnimValue] = useState(new Animated.Value(0))
  const [headerBalanceLeftMarginAnimValue] = useState(new Animated.Value(0))
  const [headerFullNameOpacityAnimValue] = useState(new Animated.Value(1))
  const store = SimpleStore.useStore()
  const gdstore = GDStore.useStore()
  const [showDialog] = useDialog()
  const [showErrorDialog] = useErrorDialog()
  const showDeleteAccountDialog = useDeleteAccountDialog(showErrorDialog)
  const [update, setUpdate] = useState(0)
  const [showDelayedTimer, setShowDelayedTimer] = useState()
  const [itemModal, setItemModal] = useState()
  const currentScreen = store.get('currentScreen')
  const loadingIndicator = store.get('loadingIndicator')
  const loadAnimShown = store.get('feedLoadAnimShown')
  const { balance, entitlement } = gdstore.get('account')
  const { avatar, fullName } = useProfile()
  const [feeds, setFeeds] = useState([])
  const [headerLarge, setHeaderLarge] = useState(true)
  const { appState } = useAppState()
  const [animateMarket, setAnimateMarket] = useState(false)
  const [activeTab, setActiveTab] = useState(FeedCategories.All)
  const { setDialogBlur } = useContext(GlobalTogglesContext)

  const [price, showPrice] = useGoodDollarPrice()

  useInviteCode() //preload user invite code

  const headerAnimateStyles = {
    position: 'relative',
    height: headerHeightAnimValue,
  }

  const fullNameAnimateStyles = {
    opacity: headerFullNameOpacityAnimValue,
  }

  const avatarAnimStyles = {
    height: headerAvatarAnimValue,
    width: headerAvatarAnimValue,
    left: headerAvatarLeftAnimValue,
  }

  const balanceAnimStyles = {
    bottom: headerBalanceBottomAnimValue,
    marginRight: headerBalanceRightMarginAnimValue,
    marginLeft: Platform.select({
      android: headerLarge ? 0 : 'auto',
      default: headerBalanceLeftMarginAnimValue,
    }),
  }

  const calculateHeaderLayoutSizes = useCallback(() => {
    const newScreenWidth = getMaxDeviceWidth()
    const newHeaderContentWidth = newScreenWidth - _theme.sizes.default * 2 * 2
    const newAvatarCenteredPosition = newHeaderContentWidth / 2 - 34

    setHeaderContentWidth(newHeaderContentWidth)
    setAvatarCenteredPosition(newAvatarCenteredPosition)
  }, [setHeaderContentWidth, setAvatarCenteredPosition])

  const balanceFormatter = useMemo(
    () => (headerLarge || Math.floor(Math.log10(balance)) + 1 <= 12 ? null : abbreviateBalance),
    [balance, headerLarge],
  )

  const onBannerClicked = useOnPress(() => {
    fireEvent(INVITE_BANNER)
    Linking.openURL('https://ubi.gd/give')
  }, [navigation])

  const listHeaderComponent = isCryptoLiteracy ? <CryptoLiteracyBanner onPress={onBannerClicked} /> : null

  const listFooterComponent = <Separator color="transparent" width={50} />

  const handleDeleteRedirect = useCallback(() => {
    if (navigation.state.key === 'Delete') {
      showDeleteAccountDialog()
    }
  }, [navigation, showDeleteAccountDialog])

  const getFeedPage = useCallback(
    async (reset = false, tab = activeTab) => {
      let res = []
      const release = await feedMutex.lock()

      try {
        log.debug('getFeedPage:', { reset, feeds, loadAnimShown, didRender, tab })

        const feedPromise = userStorage
          .getFormattedEvents(PAGE_SIZE, reset, tab)
          .catch(e => log.error('getInitialFeed failed:', e.message, e))

        if (reset) {
          // a flag used to show feed load animation only at the first app loading
          //subscribeToFeed calls this method on mount effect without dependencies because currently we dont want it re-subscribe
          //so we use a global variable
          if (!didRender) {
            log.debug('waiting for feed animation')
            didRender = true
          }
          res = (await feedPromise) || []
          res.length > 0 && !didRender && store.set('feedLoadAnimShown')(true)
          feedRef.current = res
          res.length > 0 && setFeeds(res)
        } else {
          res = (await feedPromise) || []
          const newFeed = uniqBy(concat(feedRef.current, res), 'id')
          feedRef.current = newFeed
          res.length > 0 && setFeeds(newFeed)
        }

        log.debug('getFeedPage getFormattedEvents result:', {
          reset,
          res,
          resultSize: res.length,
          feedItems: feedRef.current.length,
        })
      } catch (e) {
        log.warn('getFeedPage failed', e.message, e)
      } finally {
        release()
      }
    },
    [loadAnimShown, store, setFeeds, feedRef, activeTab],
  )

  const [feedLoaded, setFeedLoaded] = useState(false)

  //subscribeToFeed probably should be an effect that updates the feed items
  //as they come in, currently on each new item it simply reset the feed
  //currently it seems too complicated to make it its own effect as it both depends on "feeds" and changes them
  //which would lead to many unwanted subscribe/unsubscribe
  const subscribeToFeed = async () => {
    await getFeedPage(true)

    userStorage.feedStorage.feedEvents.on('updated', onFeedUpdated)
  }

  const onFeedUpdated = useCallback(
    debounce(
      event => {
        log.debug('feed cache updated', { event })
        getFeedPage(true)
      },
      300,
      { leading: false }, //this delay seems to solve error from dexie about indexeddb transaction
    ),
    [getFeedPage],
  )

  const handleFeedEvent = () => {
    const { params } = navigation.state || {}

    log.debug('handle event effect dashboard', { params })
    if (!params) {
      return
    }

    const { event } = params
    if (event) {
      showNewFeedEvent(params)
    }
  }

  const claimAnimValue = useRef(new Animated.Value(1)).current

  const claimScale = useRef({
    transform: [
      {
        scale: claimAnimValue,
      },
    ],
  }).current

  useEffect(() => {
    if (feedLoaded && appState === 'active') {
      animateItems()
    }
  }, [appState, feedLoaded])

  const animateClaim = useCallback(() => {
    if (!entitlement) {
      return
    }

    return new Promise(resolve =>
      Animated.sequence([
        Animated.timing(claimAnimValue, {
          toValue: 1.4,
          duration: 750,
          easing: Easing.ease,
          delay: 1000,
          useNativeDriver: useNativeDriverForAnimation,
        }),
        Animated.timing(claimAnimValue, {
          toValue: 1,
          duration: 750,
          easing: Easing.ease,
          useNativeDriver: useNativeDriverForAnimation,
        }),
      ]).start(resolve),
    )
  }, [entitlement])

  const animateItems = useCallback(async () => {
    await animateClaim()
    setAnimateMarket(true)
  }, [animateClaim, setAnimateMarket])

  const showDelayed = useCallback(() => {
    if (!assertStore(store, log, 'Failed to show AddWebApp modal')) {
      return
    }

    const id = setTimeout(() => {
      //wait until not loading and not showing other modal (see use effect)
      //mark as displayed
      setShowDelayedTimer(true)
      store.set('addWebApp')({ show: true })
    }, 2000)
    setShowDelayedTimer(id)
  }, [setShowDelayedTimer, store])

  /**
   * rerender on screen size change
   */
  const handleResize = useCallback(
    debounce(() => {
      setUpdate(Date.now())
      calculateHeaderLayoutSizes()
    }, 100),
    [setUpdate],
  )

  // const nextFeed = x => console.log('end reached', { x })
  const nextFeed = useCallback(
    debounce(
      ({ distanceFromEnd }) => {
        if (distanceFromEnd > 0 && feedRef.current.length > 0) {
          log.debug('getNextFeed called', feedRef.current.length, { distanceFromEnd })
          return getFeedPage()
        }
      },
      100,
      { leading: false }, //this delay seems to solve error from dexie about indexeddb transaction
    ),
    [getFeedPage],
  )

  const initDashboard = async () => {
    await handleFeedEvent()
    handleDeleteRedirect()
    await subscribeToFeed().catch(e => log.error('initDashboard feed failed', e.message, e))

    setFeedLoaded(true)

    // setTimeout(animateItems, marketAnimationDuration)

    initTransferEvents(gdstore)

    log.debug('initDashboard subscribed to feed')

    // InteractionManager.runAfterInteractions(handleFeedEvent)
    resizeSubscriptionRef.current = Dimensions.addEventListener('change', handleResize)

    initBGFetch()
  }

  useEffect(() => {
    saveBalanceBlockWidth()
  }, [balance])

  // The width of the balance block required to calculate its left margin when collapsing the header
  // The balance always changes so the width is dynamical.
  // Animation functionality requires positioning props to be set with numbers.
  const saveBalanceBlockWidth = useCallback(async () => {
    const { current: balanceView } = balanceRef

    if (!balanceView) {
      return
    }

    const measurements = await measure(balanceView)

    // Android never gets values from measure causing animation to crash because of NaN
    const width = measurements.width || 0

    setBalanceBlockWidth(width)
  }, [setBalanceBlockWidth])

  useEffect(() => {
    const timing = 250
    const fullNameOpacityTiming = 150
    const easingIn = Easing.in(Easing.quad)
    const easingOut = Easing.out(Easing.quad)

    // calculate left margin for aligning the balance to the right
    // - 20 is to give more space to the number, otherwise (in native) it gets cut on the right side
    const balanceCalculatedLeftMargin = headerContentWidth - balanceBlockWidth - 20

    if (headerLarge) {
      //useNativeDriver is always false because native doesnt support animating height
      Animated.parallel([
        Animated.timing(headerAvatarAnimValue, {
          toValue: 68,
          duration: timing,
          easing: easingOut,
          useNativeDriver: false,
        }),
        Animated.timing(headerHeightAnimValue, {
          toValue: 176,
          duration: timing,
          easing: easingOut,
          useNativeDriver: false,
        }),
        Animated.timing(headerAvatarLeftAnimValue, {
          toValue: 0,
          duration: timing,
          easing: easingOut,
          useNativeDriver: false,
        }),
        Animated.timing(headerFullNameOpacityAnimValue, {
          toValue: 1,
          duration: fullNameOpacityTiming,
          easing: easingOut,
          useNativeDriver: false,
        }),
        Animated.timing(headerBalanceBottomAnimValue, {
          toValue: 0,
          duration: timing,
          easing: easingOut,
          useNativeDriver: false,
        }),
        Animated.timing(headerBalanceRightMarginAnimValue, {
          toValue: 0,
          duration: timing,
          easing: easingOut,
          useNativeDriver: false,
        }),
        Animated.timing(headerBalanceLeftMarginAnimValue, {
          toValue: 0,
          duration: timing,
          easing: easingOut,
          useNativeDriver: false,
        }),
      ]).start()
    } else {
      //useNativeDriver is always false because native doesnt support animating height
      Animated.parallel([
        Animated.timing(headerAvatarAnimValue, {
          toValue: 42,
          duration: timing,
          easing: easingIn,
          useNativeDriver: false,
        }),
        Animated.timing(headerHeightAnimValue, {
          toValue: Platform.select({ web: 40, default: 50 }),
          duration: timing,
          easing: easingIn,
          useNativeDriver: false,
        }),
        Animated.timing(headerAvatarLeftAnimValue, {
          toValue: initialAvatarLeftPosition,
          duration: timing,
          easing: easingIn,
          useNativeDriver: false,
        }),
        Animated.timing(headerFullNameOpacityAnimValue, {
          toValue: 0,
          duration: fullNameOpacityTiming,
          easing: easingIn,
          useNativeDriver: false,
        }),
        Animated.timing(headerBalanceBottomAnimValue, {
          toValue: Platform.select({ web: 68, default: 60 }),
          duration: timing,
          easing: easingIn,
          useNativeDriver: false,
        }),
        Animated.timing(headerBalanceRightMarginAnimValue, {
          toValue: 24,
          duration: timing,
          easing: easingIn,
          useNativeDriver: false,
        }),
        Animated.timing(headerBalanceLeftMarginAnimValue, {
          toValue: balanceCalculatedLeftMargin,
          duration: timing,
          easing: easingIn,
          useNativeDriver: false,
        }),
      ]).start()
    }
  }, [headerLarge, balance, update, avatarCenteredPosition, headerContentWidth, balanceBlockWidth])

  useEffect(() => {
    log.debug('Dashboard didmount', navigation)
    initDashboard()

    return function() {
      const { current: subscription } = resizeSubscriptionRef

      if (subscription) {
        subscription.remove()
      }

      resizeSubscriptionRef.current = null
      userStorage.feedStorage.feedEvents.off('updated', onFeedUpdated)
    }
  }, [])

  /**
   * don't show delayed items such as add to home popup if some other dialog is showing
   */
  useEffect(() => {
    const showingSomething = get(currentScreen, 'dialogData.visible') || get(loadingIndicator, 'loading') || itemModal

    if (showDelayedTimer !== true && showDelayedTimer && showingSomething) {
      setShowDelayedTimer(clearTimeout(showDelayedTimer))
    } else if (!showDelayedTimer) {
      showDelayed()
    }
  }, [get(currentScreen, 'dialogData.visible'), get(loadingIndicator, 'loading'), itemModal])

  const showEventModal = useCallback(
    currentFeed => {
      setItemModal(currentFeed)
    },
    [store],
  )

  const getNotificationItem = async () => {
    const notificationOpened = await AsyncStorage.getItem('GD_NOTIFICATION_OPENED')
    if (notificationOpened) {
      const item = feeds.find(feed => feed.id === notificationOpened)
      handleFeedSelection(item, true)
      return AsyncStorage.removeItem('GD_NOTIFICATION_OPENED')
    }
  }

  useEffect(() => {
    if (appState === 'active') {
      if (feedRef.current.length) {
        getNotificationItem()
      }
    }
  }, [appState])

  const handleFeedSelection = useCallback(
    (receipt, horizontal) => {
      const {
        type,
        data: { link },
      } = receipt
      if (type === 'news') {
        link && Linking.openURL(link).catch(e => log.error('Open news feed error', e))
        return
      }
      showEventModal(horizontal ? receipt : null)
      setDialogBlur(horizontal)
    },
    [showEventModal, setDialogBlur],
  )

  const showNewFeedEvent = useCallback(
    async eventId => {
      try {
        const item = await userStorage.getFormatedEventById(eventId)
        log.info('showNewFeedEvent', { eventId, item })
        if (item) {
          showEventModal(item)
        } else {
          showDialog({
            title: t`Error`,
            message: t`Event does not exist`,
          })
        }
      } catch (e) {
        showDialog({
          title: t`Error`,
          message: t`Event does not exist`,
        })
      }
    },
    [showDialog, showEventModal],
  )

  const goToProfile = useOnPress(() => screenProps.push('Profile'), [screenProps])

  const handleScrollEnd = useCallback(
    ({ nativeEvent }) => {
      fireEvent(SCROLL_FEED)
      const minScrollRequired = 150
      const scrollPosition = nativeEvent.contentOffset.y
      const minScrollRequiredISH = headerLarge ? minScrollRequired : minScrollRequired * 2
      const scrollPositionISH = headerLarge ? scrollPosition : scrollPosition + minScrollRequired
      if (feedRef.current.length > 10 && scrollPositionISH > minScrollRequiredISH) {
        if (headerLarge) {
          setHeaderLarge(false)
        }
      } else {
        if (!headerLarge) {
          setHeaderLarge(true)
        }
      }
    },
    [headerLarge, setHeaderLarge],
  )

  const handleScrollEndDebounced = useMemo(() => _debounce(handleScrollEnd, 300), [handleScrollEnd])

  const calculateFontSize = useMemo(
    () => ({
      fontSize: normalizeByLength(weiToGd(balance), 42, 10),
    }),
    [balance],
  )

  const calculateUSDWorthOfBalance = useMemo(
    () => (showPrice ? formatWithFixedValueDigits(price * weiToGd(balance)) : null),
    [showPrice, price, balance],
  )

  // for native we able handle onMomentumScrollEnd, but for web we able to handle only onScroll event,
  // so we need to imitate onMomentumScrollEnd for web
  const onScroll = Platform.select({
    web: handleScrollEndDebounced,
    default: noop,
  })

  return (
    <Wrapper style={styles.dashboardWrapper} withGradient={false}>
      <Section style={[styles.topInfo]}>
        <Animated.View style={headerAnimateStyles}>
          <Section.Stack alignItems="center" style={styles.headerWrapper}>
            <Animated.View style={avatarAnimStyles}>
              <TouchableOpacity onPress={goToProfile} style={styles.avatarWrapper}>
                <Avatar
                  source={avatar}
                  style={styles.avatar}
                  imageStyle={styles.avatar}
                  unknownStyle={styles.avatar}
                  plain
                />
              </TouchableOpacity>
            </Animated.View>
            <Animated.View style={[styles.headerFullName, fullNameAnimateStyles]}>
              <Section.Text color="gray80Percent" fontFamily={theme.fonts.slab} fontSize={18}>
                {fullName || ' '}
              </Section.Text>
            </Animated.View>
            <Animated.View style={[styles.bigNumberWrapper, balanceAnimStyles]}>
              <View ref={balanceRef}>
                <BigGoodDollar
                  testID="amount_value"
                  number={balance}
                  bigNumberStyles={[styles.bigNumberStyles, calculateFontSize]}
                  formatter={balanceFormatter}
                  bigNumberUnitStyles={styles.bigNumberUnitStyles}
                  bigNumberProps={{
                    numberOfLines: 1,
                  }}
                  style={styles.bigGoodDollar}
                />
              </View>
              {headerLarge && showPrice && (
                <Section.Text style={styles.gdPrice}>
                  ≈ {calculateUSDWorthOfBalance} USD <GoodDollarPriceInfo />
                </Section.Text>
              )}
            </Animated.View>
          </Section.Stack>
        </Animated.View>
        <Section.Row style={styles.buttonsRow}>
          <PushButton
            icon="send"
            iconAlignment="left"
            routeName="Amount"
            iconSize={20}
            screenProps={screenProps}
            style={styles.leftButton}
            contentStyle={styles.leftButtonContent}
            textStyle={styles.leftButtonText}
            params={{
              action: 'Send',
            }}
            compact
          >
            Send
          </PushButton>
          <ClaimButton
            screenProps={screenProps}
            amount={weiToMask(entitlement, { showUnits: true })}
            animated
            animatedScale={claimScale}
          />
          <PushButton
            icon="receive"
            iconSize={20}
            iconAlignment="right"
            routeName={'Receive'}
            screenProps={screenProps}
            style={styles.rightButton}
            contentStyle={styles.rightButtonContent}
            textStyle={styles.rightButtonText}
            compact
          >
            Receive
          </PushButton>
        </Section.Row>
      </Section>

      <Section style={{ marginHorizontal: 8, backgroundColor: undefined, paddingHorizontal: 0, paddingBottom: 6 }}>
        <Section.Row>
          {FeedCategories.all.map(tab => (
            <FeedTab
              tab={tab}
              key={tab || 'all'}
              setActiveTab={setActiveTab}
              getFeedPage={getFeedPage}
              activeTab={activeTab}
            />
          ))}
        </Section.Row>
      </Section>

      <FeedList
        data={feedRef.current}
        handleFeedSelection={handleFeedSelection}
        initialNumToRender={10}
        onEndReached={nextFeed} // How far from the end the bottom edge of the list must be from the end of the content to trigger the onEndReached callback.
        // we can use decimal (from 0 to 1) or integer numbers. Integer - it is a pixels from the end. Decimal it is the percentage from the end
        listHeaderComponent={listHeaderComponent}
        listFooterComponent={listFooterComponent}
        onEndReachedThreshold={0.8}
        windowSize={10} // Determines the maximum number of items rendered outside of the visible area
        onScrollEnd={handleScrollEnd}
        onScroll={onScroll}
        headerLarge={headerLarge}
        scrollEventThrottle={300}
      />
      {itemModal && (
        <FeedModalList
          data={feedRef.current}
          handleFeedSelection={handleFeedSelection}
          onEndReached={nextFeed}
          selectedFeed={itemModal}
          navigation={navigation}
        />
      )}
      {animateMarket && <GoodMarketButton />}
    </Wrapper>
  )
}

const getStylesFromProps = ({ theme }) => ({
  headerWrapper: {
    height: '100%',
    paddingBottom: Platform.select({
      web: theme.sizes.defaultHalf,
      default: theme.sizes.default,
    }),
  },
  headerFullName: {
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: -1,
  },
  dashboardWrapper: {
    backgroundColor: theme.colors.lightGray,
    flexGrow: 1,
    padding: 0,
    ...Platform.select({
      web: { overflowY: 'hidden' },
    }),
  },
  topInfo: {
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    marginLeft: theme.sizes.default,
    marginRight: theme.sizes.default,
    paddingBottom: 6,
    paddingLeft: theme.sizes.default,
    paddingRight: theme.sizes.default,
    paddingTop: theme.sizes.defaultDouble,
    marginBottom: -3,
    zIndex: 10,
    position: 'relative',
  },
  userInfo: {
    backgroundColor: 'transparent',
    marginBottom: 12,
  },
  userInfoHorizontal: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 0,
    paddingLeft: 0,
    paddingRight: 0,
    paddingTop: 0,
  },
  avatarWrapper: {
    height: '100%',
    width: '100%',
  },
  avatar: {
    width: '100%',
    height: '100%',
    borderWidth: 0,
    backgroundColor: 'transparent',
    borderRadius: Platform.select({
      web: '50%',
      default: 150 / 2,
    }),
  },
  buttonsRow: {
    alignItems: 'center',
    height: 70,
    justifyContent: 'space-between',
    marginBottom: 0,
    marginTop: 1,
  },
  gdPrice: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    fontSize: 14,
    color: theme.colors.secondary,
    fontWeight: 'bold',
  },
  leftButton: {
    flex: 1,
    height: 44,
    marginRight: -12,
    elevation: 0,
    display: 'flex',
    justifyContent: 'center',
  },
  leftButtonContent: {
    alignItems: 'stretch',
    justifyContent: 'center',
  },
  rightButton: {
    flex: 1,
    height: 44,
    marginLeft: -12,
    elevation: 0,
    display: 'flex',
    justifyContent: 'center',
  },
  rightButtonContent: {
    alignItems: 'stretch',
    justifyContent: 'center',
  },
  leftButtonText: {
    marginRight: theme.sizes.defaultDouble,
  },
  rightButtonText: {
    marginLeft: theme.sizes.defaultDouble,
  },
  bigNumberWrapper: {
    alignItems: 'center',
  },
  bigNumberUnitStyles: {
    marginRight: normalize(-20),
    alignSelf: 'stretch',
  },
  bigNumberStyles: {
    fontWeight: '700',
    fontSize: 42,
    lineHeight: 42,
    height: 42,
    textAlign: 'center',
    alignSelf: 'stretch',
  },
  bigGoodDollar: {
    width: '100%',
  },
})

Dashboard.navigationOptions = ({ navigation, screenProps }) => {
  return {
    navigationBar: () => <TabsView goTo={navigation.navigate} routes={screenProps.routes} navigation={navigation} />,
    title: 'Wallet',
    disableScroll: true,
  }
}

const WrappedDashboard = withStyles(getStylesFromProps)(Dashboard)

export default createStackNavigator({
  Home: WrappedDashboard,
  Delete: WrappedDashboard,
  Claim,
  Receive,
  Who: {
    screen: Who,
    path: ':action/Who',
    params: { action: ACTION_SEND },
  },
  Amount: {
    screen: Amount,
    path: ':action/Amount',
    params: { action: ACTION_SEND },
  },
  Reason: {
    screen: Reason,
    path: ':action/Reason',
    params: { action: ACTION_SEND },
  },
  ReceiveToAddress,
  ReceiveSummary,

  SendLinkSummary,
  SendByQR,
  SendToAddress,

  FaceVerification,
  FaceVerificationIntro,
  FaceVerificationError,

  TransactionConfirmation: {
    screen: TransactionConfirmation,
    path: ':action/TransactionConfirmation',
    params: { action: ACTION_SEND },
  },

  // PP: PrivacyPolicy,
  // PrivacyArticle,
  TOU: PrivacyPolicyAndTerms,
  Support,
  Statistics,
  Recover: Mnemonics,
  OutOfGasError,
  Rewards: Invite,
  HandlePaymentLink,
})
