// @flow
import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { Animated, Dimensions, Easing, Platform, TouchableOpacity, View } from 'react-native'
import { concat, noop, uniqBy } from 'lodash'
import { useDebouncedCallback } from 'use-debounce'
import Mutex from 'await-mutex'
import { t } from '@lingui/macro'
import { WalletChatWidget } from 'react-native-wallet-chat'
import moment from 'moment'

import AsyncStorage from '../../lib/utils/asyncStorage'
import { normalizeByLength } from '../../lib/utils/normalizeText'
import { useDialog } from '../../lib/dialog/useDialog'
import usePropsRefs from '../../lib/hooks/usePropsRefs'
import { openLink } from '../../lib/utils/linking'
import { getRouteParams, lazyScreens, withNavigationOptions } from '../../lib/utils/navigation'
import { decimalsToFixed, supportsG$, supportsG$UBI, toMask } from '../../lib/wallet/utils'
import { formatWithAbbreviations, formatWithFixedValueDigits } from '../../lib/utils/formatNumber'
import { fireEvent, GOTO_TAB_FEED, MIGRATION_INVITED, SCROLL_FEED, SWITCH_NETWORK } from '../../lib/analytics/analytics'
import {
  GoodWalletContext,
  TokenContext,
  useFixedDecimals,
  useFormatG$,
  useSwitchNetwork,
  useUserStorage,
  useWalletData,
} from '../../lib/wallet/GoodWalletProvider'
import { createStackNavigator } from '../appNavigation/stackNavigation'
import useAppState from '../../lib/hooks/useAppState'
import useGoodDollarPrice from '../reserve/useGoodDollarPrice'

import { PushButton } from '../appNavigation/PushButton'
import { isWeb, useNativeDriverForAnimation } from '../../lib/utils/platform'
import TabsView from '../appNavigation/TabsView'
import BigGoodDollar from '../common/view/BigGoodDollar'

import ClaimButton from '../common/buttons/ClaimButton'
import TabButton from '../common/buttons/TabButton'
import Section from '../common/layout/Section'
import Wrapper from '../common/layout/Wrapper'
import logger from '../../lib/logger/js-logger'
import { Statistics } from '../webView/webViewInstances'
import { withStyles } from '../../lib/styles'
import Mnemonics from '../signin/Mnemonics'
import useDeleteAccountDialog from '../../lib/hooks/useDeleteAccountDialog'
import { getMaxDeviceWidth } from '../../lib/utils/sizes'
import { theme as _theme, theme } from '../theme/styles'
import useOnPress from '../../lib/hooks/useOnPress'
import Invite from '../invite/Invite'
import Avatar from '../common/view/Avatar'
import { createUrlObject } from '../../lib/utils/uri'
import useProfile from '../../lib/userStorage/useProfile'
import { GlobalTogglesContext } from '../../lib/contexts/togglesContext'
import Separator from '../common/layout/Separator'
import { FeedCategories } from '../../lib/userStorage/FeedCategory'
import WalletConnect from '../walletconnect/WalletConnectScan'
import useRefundDialog from '../refund/hooks/useRefundDialog'
import GoodActionBar from '../appNavigation/actionBar/components/GoodActionBar'
import { IconButton, Text } from '../../components/common'
import { retry } from '../../lib/utils/async'

import GreenCircle from '../../assets/ellipse46.svg'
import { useInviteCode } from '../invite/useInvites'
import Config from '../../config/config'
import { FeedItemType } from '../../lib/userStorage/FeedStorage'
import { FVNavigationBar } from '../faceVerification/standalone/AppRouter'
import useGiveUpDialog from '../faceVerification/standalone/hooks/useGiveUpDialog'
import { useSecurityDialog } from '../security/securityDialog'
import { useFeatureFlagOrDefault, useFlagWithPayload } from '../../lib/hooks/useFeatureFlags'
import { PAGE_SIZE } from './utils/feed'
import PrivacyPolicyAndTerms from './PrivacyPolicyAndTerms'
import Amount from './Amount'
import Claim from './Claim'
import FeedList from './FeedList'
import FeedModalList from './FeedModalList'
import OutOfGasError from './OutOfGasError'
import Reason from './Reason'
import Receive from './Receive'
import HandlePaymentLink from './HandlePaymentLink'
import Who from './Who'
import ReceiveSummary from './ReceiveSummary'
import ReceiveToAddress from './ReceiveToAddress'
import TransactionConfirmation from './TransactionConfirmation'
import SendToAddress from './SendToAddress'
import SendByQR from './SendByQR'
import SendLinkSummary from './SendLinkSummary'
import { ACTION_SEND } from './utils/sendReceiveFlow'
import WelcomeOffer from './../../components/common/dialogs/WelcomeOffer'

import GoodDollarPriceInfo from './GoodDollarPriceInfo/GoodDollarPriceInfo'
import Settings from './Settings'

const log = logger.child({ from: 'Dashboard' })
const { isDeltaApp } = Config

// prettier-ignore
const [FaceVerification, FaceVerificationIntro, FaceVerificationError] = withNavigationOptions({
  navigationBarHidden: false,
  title: 'Face Verification',
  navigationBar: FVNavigationBar,
})(
  lazyScreens(
    () => import('../faceVerification'),
    'FaceVerification',
    'FaceVerificationIntro',
    'FaceVerificationError'
  ),
)

let didRender = false
const screenWidth = getMaxDeviceWidth()
const initialHeaderContentWidth = screenWidth - _theme.sizes.default * 2 * 2

export type DashboardProps = {
  navigation: any,
  screenProps: any,
  styles?: any,
}

const feedMutex = new Mutex()

const FeedTab = ({ setActiveTab, getFeedPage, activeTab, tab }) => {
  const onTabPress = useOnPress(() => {
    log.debug('feed category selected', { tab })
    fireEvent(GOTO_TAB_FEED, { name: tab })
    setActiveTab(tab)
    getFeedPage(true, tab)
  }, [setActiveTab, getFeedPage, tab])

  const isAll = tab === FeedCategories.All
  const isNews = tab === FeedCategories.News
  const isTransactions = tab === FeedCategories.Transactions

  return (
    <TabButton
      onPress={onTabPress}
      isActive={tab === activeTab}
      hasLeftBorder={!isAll}
      flex={isTransactions ? 2.5 : 1}
      roundnessLeft={isAll ? 5 : 0}
      roundnessRight={isNews ? 5 : 0}
    >
      {FeedCategories.label(tab)}
    </TabButton>
  )
}

const BridgeButton = ({ onPress }: { onPress: any }) => (
  <IconButton
    name="bridge"
    onPress={onPress}
    size={30}
    bgColor="none"
    disabled={false}
    circle={false}
    color={theme.colors.lightGdBlue}
  />
)

const balanceStyles = {
  multiBalanceItem: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    fontSize: 14,
    color: theme.colors.secondary,
    fontWeight: 'bold',
    width: Platform.select({
      web: '46%',
    }),
    backgroundColor: theme.colors.secondaryGray,
    padding: 0,
    margin: 0,
    fontFamily: 'Roboto Slab',
  },
  switchButton: {
    display: 'flex',
    alignItems: 'center',
    flexDirection: 'column',
  },
  networkName: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: 55,
  },
}

const BalanceAndSwitch = ({
  color,
  textStyles,
  networkName,
  balance,
}: {
  styles: any,
  color: string,
  textStyles: any,
  networkName: string,
  balance: any,
}) => {
  const { currentNetwork, switchNetwork } = useSwitchNetwork()
  const altNetwork = currentNetwork === 'FUSE' ? 'CELO' : 'FUSE'
  const networkNameUp = networkName.toUpperCase()
  const isCurrent = currentNetwork === networkNameUp
  const toggle = () => {
    fireEvent(SWITCH_NETWORK, { type: 'balance' })
    switchNetwork(altNetwork)
  }
  const formattedBalance = formatWithAbbreviations(balance, 2)

  return (
    <Section style={[balanceStyles.multiBalanceItem, { opacity: isCurrent ? 1 : 0.5 }]}>
      <TouchableOpacity onPress={isCurrent ? noop : toggle} style={balanceStyles.switchButton}>
        <Text fontSize={16} fontWeight="bold" fontFamily={theme.fonts.slab}>
          {formattedBalance}
        </Text>
        <View style={balanceStyles.networkName}>
          <View style={[balanceStyles.activeIcon, { display: !networkName || isCurrent ? 'flex' : 'none' }]}>
            <GreenCircle />
          </View>
          <Text fontSize={12} color={theme.colors.darkGray} fontWeight="normal" fontFamily={theme.fonts.slab}>
            G$ {networkName}
          </Text>
        </View>
      </TouchableOpacity>
    </Section>
  )
}

const TotalBalance = ({ styles, theme, headerLarge, network, balance: totalBalance }) => {
  const { native, token, balance: tokenBalance } = useContext(TokenContext)
  const [price, showPrice] = useGoodDollarPrice()
  const formatFixed = useFixedDecimals(token)
  const isUBI = supportsG$UBI(network)
  const showUsdBalance = useFeatureFlagOrDefault('show-usd-balance')

  // show aggregated balance on FUSE/CELO, delta only
  const balance = isDeltaApp && (native || !isUBI) ? tokenBalance : totalBalance

  const balanceFormatter = useCallback(
    amount => (isDeltaApp && native ? formatFixed(amount) : formatWithAbbreviations(amount, 2)),
    [native, formatFixed],
  )

  const calculateFontSize = useMemo(
    () => ({
      fontSize: balance ? normalizeByLength(balance, 42, 10) : 42,
    }),
    [balance],
  )

  const calculateUSDWorthOfBalance = useMemo(
    () => (showPrice && (!isDeltaApp || !native) ? formatWithFixedValueDigits(price * Number(balance)) : null),
    [showPrice, price, balance, native],
  )

  if (isDeltaApp && !native && !supportsG$(network)) {
    return null
  }

  return (
    <Animated.View style={styles.totalBalance}>
      {headerLarge && (!isDeltaApp || isUBI) && (
        <Text color="gray100Percent" fontFamily={theme.fonts.default} fontSize={12} style={styles.totalBalanceText}>
          {` MY TOTAL BALANCE `}
        </Text>
      )}
      <View style={styles.balanceUsdRow}>
        <BigGoodDollar
          testID="amount_value"
          number={balance}
          formatter={balanceFormatter}
          unit={isDeltaApp && native ? token : null}
          bigNumberStyles={[styles.bigNumberStyles, calculateFontSize]}
          bigNumberUnitStyles={styles.bigNumberUnitStyles}
          bigNumberProps={{
            numberOfLines: 1,
          }}
          style={styles.bigGoodDollar}
        />
      </View>
      {/* TODO: get ETH/GETH/FUSE/CELO price and calculate native tokens worth, may not needed for demo */}
      {headerLarge && (!isDeltaApp || !native) && showUsdBalance && (
        <Text style={styles.gdPrice}>
          ≈ {calculateUSDWorthOfBalance} USD <GoodDollarPriceInfo />
        </Text>
      )}
    </Animated.View>
  )
}

const Dashboard = props => {
  const feedRef = useRef([])
  const resizeSubscriptionRef = useRef()
  const { screenProps, styles, theme, navigation }: DashboardProps = props
  const [headerContentWidth, setHeaderContentWidth] = useState(initialHeaderContentWidth)
  const [headerAvatarAnimValue] = useState(new Animated.Value(42))
  const [headerBalanceBottomAnimValue] = useState(new Animated.Value(0))
  const [avatarCenteredPosition, setAvatarCenteredPosition] = useState(0)
  const [headerBalanceRightMarginAnimValue] = useState(new Animated.Value(0))
  const [headerBalanceLeftMarginAnimValue] = useState(new Animated.Value(0))
  const [headerFullNameOpacityAnimValue] = useState(new Animated.Value(1))
  const [topInfoHeight] = useState(new Animated.Value(240))
  const [balanceTopAnimValue] = useState(new Animated.Value(0))
  const { hideDialog, isDialogShown, showDialog, showErrorDialog } = useDialog()
  const showDeleteAccountDialog = useDeleteAccountDialog(showErrorDialog)
  const [update, setUpdate] = useState(0)
  const [showDelayedTimer, setShowDelayedTimer] = useState()
  const [itemModal, setItemModal] = useState()
  const { totalBalance: balance, fuseBalance, celoBalance, dailyUBI, isCitizen } = useWalletData()
  const entitlement = Number(dailyUBI)

  const { toDecimals } = useFormatG$()
  const { avatar, fullName } = useProfile()
  const [feeds, setFeeds] = useState([])
  const [headerLarge, setHeaderLarge] = useState(true)
  const { appState } = useAppState()
  const { setDialogBlur, setAddWebApp, isLoadingIndicator, setFeedLoadAnimShown } = useContext(GlobalTogglesContext)
  const userStorage = useUserStorage()
  const [activeTab, setActiveTab] = useState(FeedCategories.All)
  const [getCurrentTab] = usePropsRefs([activeTab])
  const { onGiveUp } = useGiveUpDialog(navigation, 'cancelled')

  const { currentNetwork } = useSwitchNetwork()

  const walletChatEnabled = useFeatureFlagOrDefault('wallet-chat')

  const isBridgeActive = useFeatureFlagOrDefault('micro-bridge')

  const sendReceiveEnabled = useFeatureFlagOrDefault('send-receive-feature')
  const dashboardButtonsEnabled = useFeatureFlagOrDefault('dashboard-buttons')
  const showWelcomeOffer = useFlagWithPayload('show-welcome-offer')
  const payload = useFlagWithPayload('claim-feature')

  const { message: claimDisabledMessage, enabled: claimEnabled } = payload || {}
  const { supportedCountries, enabled: welcomeOfferActive, promoUrl, offerAmount, webOnly } = showWelcomeOffer || {}

  const { securityEnabled, securityDialog } = useSecurityDialog()

  const ubiEnabled = !isDeltaApp || supportsG$UBI(currentNetwork)
  const bridgeEnabled = ubiEnabled && isBridgeActive !== false

  const { goodWallet, web3Provider } = useContext(GoodWalletContext)

  useInviteCode(true) // register user to invites contract if he has invite code
  useRefundDialog(screenProps)

  const sendReceiveMinimzedYAnimValue = new Animated.Value(0)
  const sendReceiveOutputRange = headerLarge ? [0, 500] : [100, 0]

  const fullNameAnimateStyles = {
    opacity: headerFullNameOpacityAnimValue,
  }

  const avatarAnimStyles = {
    height: headerAvatarAnimValue,
    width: headerAvatarAnimValue,
  }

  const multiBalanceAnimStyles = {
    marginTop: Platform.select({
      android: 0,
    }),
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  }

  const sendReceiveAnimStyles = {
    width: '100%',
    marginTop: 5,
    transform: [
      {
        translateY: sendReceiveMinimzedYAnimValue.interpolate({
          inputRange: [0, 1],
          outputRange: sendReceiveOutputRange,
        }),
      },
    ],
  }

  const topInfoAnimStyles = {
    height: Platform.select({
      web: topInfoHeight,
      android: 'auto',
    }),
  }

  const gdPriceAnimStyles = {
    marginTop: Platform.select({
      web: 0,
      android: 20,
    }),
  }

  const calculateHeaderLayoutSizes = useCallback(() => {
    const newScreenWidth = getMaxDeviceWidth()
    const newHeaderContentWidth = newScreenWidth - _theme.sizes.default * 2 * 2
    const newAvatarCenteredPosition = newHeaderContentWidth / 2 - 34

    setHeaderContentWidth(newHeaderContentWidth)
    setAvatarCenteredPosition(newAvatarCenteredPosition)
  }, [setHeaderContentWidth, setAvatarCenteredPosition])

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
        log.debug('getFeedPage:', { reset, feeds, didRender, tab })

        await userStorage.registeredReady

        const feedPromise = userStorage
          .getFormattedEvents(PAGE_SIZE, reset, tab)
          .catch(e => log.error('getInitialFeed failed:', e.message, e))

        if (reset) {
          // a flag used to show feed load animation only at the first app loading
          // subscribeToFeed calls this method on mount effect without dependencies because currently we dont want it re-subscribe
          // so we use a global variable

          res = (await feedPromise) || []
          res.length > 0 && !didRender && setFeedLoadAnimShown(true)
          feedRef.current = res
          setFeeds(res)

          if (!didRender) {
            log.debug('waiting for feed animation')
            didRender = true
          }
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
          feedItems: feedRef.current,
        })
      } catch (e) {
        log.warn('getFeedPage failed', e.message, e)
      } finally {
        release()
      }
    },
    [setFeedLoadAnimShown, setFeeds, feedRef, userStorage, activeTab],
  )

  const [feedLoaded, setFeedLoaded] = useState(false)

  // subscribeToFeed probably should be an effect that updates the feed items
  // as they come in, currently on each new item it simply reset the feed
  // currently it seems too complicated to make it its own effect as it both depends on "feeds" and changes them
  // which would lead to many unwanted subscribe/unsubscribe
  const subscribeToFeed = async () => {
    const { feedStorage } = userStorage

    await getFeedPage(true)

    feedStorage.feedEvents.on('updated', onFeedUpdated)
  }

  const onPreloadFeedPage = useCallback(
    event => {
      const currentTab = getCurrentTab()

      log.debug('feed cache updated', { event, currentTab })
      getFeedPage(true, currentTab)
    },
    [getCurrentTab, getFeedPage],
  )

  // this delay seems to solve error from dexie about indexeddb transaction
  const onFeedUpdated = useDebouncedCallback(onPreloadFeedPage, 300, { leading: false })

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

  useEffect(async () => {
    const hasStartedFV = await AsyncStorage.getItem('hasStartedFV')

    if (hasStartedFV && isCitizen) {
      onGiveUp()
    }
  }, [isCitizen])

  const dismissOffer = useCallback(async () => {
    const today = moment().format('YYYY-MM-DD')
    await AsyncStorage.setItem('shownOfferToday', today)
    hideDialog()
  }, [hideDialog])

  useEffect(async () => {
    const dontShowAgain = await AsyncStorage.getItem('dontShowWelcomeOffer')
    const shownOfferToday = await AsyncStorage.getItem('shownOfferToday')
    const today = moment().format('YYYY-MM-DD')

    if (dontShowAgain || shownOfferToday === today) {
      return
    }

    const country = await retry(
      async () => (await fetch('https://get.geojs.io/v1/ip/country.json')).json(),
      3,
      2000,
    ).then(data => data.country)

    const isEligible = supportedCountries.split(',').includes(country)

    if (((webOnly && isWeb) || !webOnly) && welcomeOfferActive && isEligible) {
      fireEvent(MIGRATION_INVITED)

      showDialog({
        content: <WelcomeOffer onDismiss={dismissOffer} promoUrl={promoUrl} offerAmount={offerAmount} />,
        titleStyle: { paddingTop: 0, marginTop: 0, minHeight: 'auto' },
        onDismiss: dismissOffer,
        showButtons: false,
      })
    }
  }, [welcomeOfferActive])

  const animateClaim = useCallback(() => {
    if (!entitlement || !supportsG$UBI(currentNetwork)) {
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
  }, [entitlement, currentNetwork])

  const animateItems = useCallback(async () => {
    await animateClaim()
  }, [animateClaim])

  const showDelayed = useCallback(() => {
    const id = setTimeout(() => {
      // wait until not loading and not showing other modal (see use effect)
      // mark as displayed
      setShowDelayedTimer(true)
      setAddWebApp({ showInitial: true, showDialog: false })
    }, 2000)
    setShowDelayedTimer(id)
  }, [setShowDelayedTimer, setAddWebApp])

  /**
   * rerender on screen size change
   */
  const _handleResize = useCallback(() => {
    setUpdate(Date.now())
    calculateHeaderLayoutSizes()
  }, [setUpdate])

  const _nextFeed = useCallback(
    ({ distanceFromEnd }) => {
      if (distanceFromEnd > 0 && feedRef.current.length > 0) {
        log.debug('getNextFeed called', feedRef.current.length, { distanceFromEnd })
        return getFeedPage()
      }
    },
    [getFeedPage],
  )

  const handleResize = useDebouncedCallback(_handleResize, 100)
  const nextFeed = useDebouncedCallback(_nextFeed, 100)

  const initDashboard = async () => {
    await handleFeedEvent()
    handleDeleteRedirect()
    await subscribeToFeed().catch(e => log.error('initDashboard feed failed', e.message, e))

    setFeedLoaded(true)

    // setTimeout(animateItems, marketAnimationDuration)

    log.debug('initDashboard subscribed to feed')

    // InteractionManager.runAfterInteractions(handleFeedEvent)
    resizeSubscriptionRef.current = Dimensions.addEventListener('change', handleResize)
  }

  useEffect(() => {
    const timing = 250
    const fullNameOpacityTiming = 150
    const easingIn = Easing.in(Easing.quad)
    const easingOut = Easing.out(Easing.quad)

    if (headerLarge) {
      // useNativeDriver is always false because native doesnt support animating height
      Animated.parallel([
        Animated.timing(headerAvatarAnimValue, {
          toValue: 40,
          duration: timing,
          easing: easingOut,
          useNativeDriver: false,
        }),
        Animated.timing(sendReceiveMinimzedYAnimValue, {
          toValue: 0,
          duration: 250,
          easing: easingOut,
          useNativeDrive: false,
        }),
        Animated.timing(balanceTopAnimValue, {
          toValue: 0,
          duration: 300,
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
        Animated.timing(topInfoHeight, {
          toValue: 240,
          duration: 200,
          easing: easingOut,
          useNativeDriver: false,
        }),
      ]).start()
    } else {
      // useNativeDriver is always false because native doesnt support animating height
      Animated.parallel([
        Animated.timing(headerAvatarAnimValue, {
          toValue: 40,
          duration: timing,
          easing: easingIn,
          useNativeDriver: false,
        }),
        Animated.timing(sendReceiveMinimzedYAnimValue, {
          toValue: 1,
          duration: 250,
          easing: easingOut,
          useNativeDrive: false,
        }),
        Animated.timing(balanceTopAnimValue, {
          toValue: 1,
          duration: 300,
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
          toValue: 120,
          duration: timing,
          easing: easingIn,
          useNativeDriver: false,
        }),
        Animated.timing(topInfoHeight, {
          toValue: 130,
          duration: timing,
          delay: 100,
          easing: easingOut,
          useNativeDriver: false,
        }),
      ]).start()
    }
  }, [headerLarge, balance, update, avatarCenteredPosition, headerContentWidth])

  useEffect(() => {
    log.debug('Dashboard didmount', { navigation })
    initDashboard()

    return () => {
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
    const showingSomething = isDialogShown || isLoadingIndicator || itemModal

    if (showDelayedTimer !== true && showDelayedTimer && showingSomething) {
      setShowDelayedTimer(clearTimeout(showDelayedTimer))
    } else if (!showDelayedTimer) {
      showDelayed()
    }
  }, [isDialogShown, isLoadingIndicator, itemModal])

  useEffect(() => {
    if (securityEnabled) {
      securityDialog()
    }
  }, [securityEnabled, securityDialog])

  const showEventModal = useCallback(
    currentFeed => {
      setItemModal(currentFeed)
    },
    [setItemModal],
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

  // reset feed everytime we switch network, as feed is filtered by networkId
  useEffect(() => {
    if (currentNetwork) {
      getFeedPage(true)
    }
  }, [currentNetwork])

  useEffect(() => {
    if (securityEnabled) {
      securityDialog()
    }
  }, [securityEnabled, securityDialog])

  const claimDisabledDialog = useCallback(
    () =>
      showDialog({
        title: t`Claiming unavailable`,
        message: claimDisabledMessage,
        type: 'info',
        showCloseButtons: true,
      }),
    [showDialog],
  )

  const handleFeedSelection = useCallback(
    (receipt, horizontal) => {
      const {
        type,
        data: { link },
      } = receipt

      if (type !== FeedItemType.EVENT_TYPE_NEWS || !link) {
        showEventModal(horizontal ? receipt : null)
        setDialogBlur(horizontal)
        return
      }

      const { pathname, params, internal } = createUrlObject(link)

      if (!internal) {
        openLink(link)
        return
      }

      navigation.navigate(getRouteParams(navigation, pathname.slice(1), params))
    },
    [showEventModal, setDialogBlur],
  )

  const showNewFeedEvent = useCallback(
    async eventId => {
      const message = t`Event does not exist`

      try {
        const item = await userStorage.getFormatedEventById(eventId)

        log.info('showNewFeedEvent', { eventId, item })

        if (!item) {
          throw new Error(message)
        }

        showEventModal(item)
      } catch (e) {
        showDialog({
          title: t`Error`,
          message,
        })
      }
    },
    [showDialog, showEventModal, userStorage],
  )

  const goToProfile = useOnPress(() => screenProps.push('Profile'), [screenProps])

  const goToBridge = useCallback(() => {
    screenProps.push('Amount', { action: 'Bridge' })
  }, [screenProps])

  const dispatchScrollEvent = useDebouncedCallback(() => fireEvent(SCROLL_FEED), 250)

  const scrollData = useMemo(() => {
    const minScrollRequired = 150
    const minScrollRequiredISH = headerLarge ? minScrollRequired : minScrollRequired * 2
    const scrollPositionGap = headerLarge ? 0 : minScrollRequired
    const newsCondition = activeTab === FeedCategories.News && feeds.length > 3
    const isFeedSizeEnough = feeds.length > 8 || newsCondition
    return { minScrollRequiredISH, scrollPositionGap, isFeedSizeEnough }
  }, [headerLarge, activeTab, feeds.length])

  const handleScrollEnd = useCallback(
    ({ nativeEvent }) => {
      const scrollPosition = nativeEvent.contentOffset.y
      const { minScrollRequiredISH, scrollPositionGap, isFeedSizeEnough } = scrollData
      const scrollPositionISH = scrollPosition + scrollPositionGap

      setHeaderLarge(!isFeedSizeEnough || scrollPositionISH < minScrollRequiredISH)
    },
    [scrollData, setHeaderLarge],
  )

  const handleScroll = useCallback(
    ({ ...args }) => {
      dispatchScrollEvent()

      if (isWeb) {
        handleScrollEnd(args)
      }
    },
    [dispatchScrollEvent, handleScrollEnd],
  )

  // const onBalanceLayout = useCallback(
  //   ({ nativeEvent }) => (balanceBlockWidthRef.current = get(nativeEvent, 'layout.width', 0)),
  //   [],
  // )

  return (
    <Wrapper style={styles.dashboardWrapper} withGradient={false}>
      <Animated.View style={[styles.topInfo, topInfoAnimStyles]}>
        <Animated.View style={styles.topHeader}>
          <Section.Stack alignItems="center" style={styles.balanceContainer}>
            <Animated.View style={styles.balanceTop}>
              <View style={styles.profileContainer}>
                <Animated.View style={styles.profileAndWalletChat}>
                  <Animated.View testID="avatar-anim-styles" style={[styles.profileIconContainer, avatarAnimStyles]}>
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
                  {walletChatEnabled && (
                    <WalletChatWidget
                      connectedWallet={
                        web3Provider
                          ? {
                              walletName: 'GoodWalletV2',
                              account: goodWallet.account,
                              chainId: goodWallet.networkId,
                              provider: web3Provider,
                            }
                          : undefined
                      }
                    />
                  )}
                </Animated.View>
                {headerLarge && (
                  <Animated.View style={[styles.headerFullName, fullNameAnimateStyles]}>
                    <Section.Text color="gray100Percent" fontFamily={theme.fonts.default} fontSize={12}>
                      {fullName || ' '}
                    </Section.Text>
                  </Animated.View>
                )}
              </View>
              <TotalBalance
                headerLarge={headerLarge}
                theme={theme}
                styles={styles}
                network={currentNetwork}
                balance={balance}
              />
            </Animated.View>
            {headerLarge && (!isDeltaApp || supportsG$(currentNetwork)) && (
              <Animated.View style={[styles.multiBalanceContainer, multiBalanceAnimStyles]}>
                <View style={styles.multiBalance}>
                  <BalanceAndSwitch balance={fuseBalance} networkName="Fuse" />
                  <Section.Text style={[styles.gdPrice, gdPriceAnimStyles, { width: '40%', fontSize: 20 }]}>
                    {bridgeEnabled && <BridgeButton onPress={goToBridge} />}
                  </Section.Text>
                  <BalanceAndSwitch balance={celoBalance} networkName="Celo" />
                </View>
              </Animated.View>
            )}
            {dashboardButtonsEnabled !== false && (
              <Animated.View style={sendReceiveAnimStyles}>
                <Section style={[styles.txButtons]}>
                  <Section.Row style={styles.buttonsRow}>
                    {sendReceiveEnabled !== false && (
                      <PushButton
                        icon="send"
                        iconAlignment="left"
                        routeName="Amount"
                        iconSize={20}
                        screenProps={screenProps}
                        style={[styles.leftButton, styles.sendReceiveButton]}
                        contentStyle={styles.leftButtonContent}
                        textStyle={styles.leftButtonText}
                        params={{
                          action: 'Send',
                        }}
                        compact
                      >
                        {t`Send`}
                      </PushButton>
                    )}
                    {ubiEnabled ? (
                      <ClaimButton
                        screenProps={screenProps}
                        {...(claimEnabled === false && {
                          onPress: claimDisabledDialog,
                          buttonStyles: { backgroundColor: theme.colors.gray80Percent },
                        })}
                        amount={toMask(decimalsToFixed(toDecimals(entitlement)), { showUnits: true })}
                        animated
                        animatedScale={claimScale}
                      />
                    ) : (
                      <View style={styles.buttonSpacer} />
                    )}
                    {sendReceiveEnabled !== false && (
                      <PushButton
                        icon="receive"
                        iconSize={20}
                        iconAlignment="right"
                        routeName={'Receive'}
                        screenProps={screenProps}
                        style={[styles.rightButton, styles.sendReceiveButton]}
                        contentStyle={styles.rightButtonContent}
                        textStyle={styles.rightButtonText}
                        compact
                      >
                        {t`Receive`}
                      </PushButton>
                    )}
                  </Section.Row>
                </Section>
              </Animated.View>
            )}
          </Section.Stack>
        </Animated.View>
      </Animated.View>

      <Section
        style={{
          marginHorizontal: 8,
          backgroundColor: undefined,
          paddingHorizontal: 0,
          paddingBottom: 6,
          paddingTop: 6,
        }}
      >
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
        listFooterComponent={listFooterComponent}
        onEndReachedThreshold={0.8}
        windowSize={10} // Determines the maximum number of items rendered outside of the visible area
        onScrollEnd={handleScrollEnd}
        onScroll={handleScroll}
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
      {<GoodActionBar navigation={navigation} />}
    </Wrapper>
  )
}

const getStylesFromProps = ({ theme }) => ({
  balanceContainer: {
    height: Platform.select({ web: 'max-content', android: 'auto' }),
    paddingBottom: Platform.select({
      web: theme.sizes.defaultHalf,
      default: theme.sizes.default,
    }),
  },
  headerFullName: {
    justifyContent: 'center',
    alignItems: 'center',
    right: 15,
    zIndex: -1,
    marginTop: 8,
    marginBottom: 8,
  },
  dashboardWrapper: {
    backgroundColor: theme.colors.secondaryGray,
    padding: 0,
    ...Platform.select({
      web: { overflowY: 'hidden' },
    }),
  },
  userInfo: {
    backgroundColor: 'transparent',
    marginBottom: 12,
  },
  topHeader: {
    position: 'relative',
  },
  topInfo: {
    position: 'relative',
    marginLeft: theme.sizes.default,
    marginRight: theme.sizes.default,
    paddingBottom: 6,
    paddingLeft: theme.sizes.default,
    paddingRight: theme.sizes.default,
    paddingTop: theme.sizes.default,
    backgroundColor: '#fff',
    zIndex: 10,
    marginTop: 16,
    marginBottom: 8,
    borderRadius: 12,
    ...Platform.select({
      web: {
        boxShadow: '0px 5px 10px rgba(23, 53, 102, 0.05)',
      },
      default: {
        shadowColor: '#173566',
        shadowOffset: {
          width: 0,
          height: theme.modals.jaggedEdgeSize,
        },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 10,
      },
    }),
    height: Platform.select({
      web: 260,
      android: 'auto',
    }),
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
    marginTop: 2,
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
    fontSize: 12,
    color: theme.colors.secondary,
    fontWeight: 'bold',
  },
  leftButton: {
    marginRight: -12,
  },
  totalBalance: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    width: 170,
    marginRight: 5,
    justifyContent: 'flex-end',
    padding: 0,
    textAlign: 'right',
    backgroundColor: 'transparent',
  },
  totalBalanceText: {
    marginTop: 8,
    marginBottom: Platform.select({
      web: 0,
      android: 8,
    }),
  },
  sendReceiveButton: {
    flex: 1,
    height: 44,
    elevation: 0,
    display: 'flex',
    justifyContent: 'center',
    backgroundColor: theme.colors.green,
  },
  leftButtonContent: {
    alignItems: 'stretch',
    justifyContent: 'center',
  },
  rightButton: {
    marginLeft: -12,
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
  bigNumberUnitStyles: {
    display: 'flex',
    alignSelf: 'stretch',
    alignItems: 'center',
  },
  bigNumberStyles: {
    fontWeight: '700',
    fontSize: 42,
    lineHeight: 42,
    height: Platform.select({
      android: 36,
    }),
    textAlign: 'right',
  },
  bigGoodDollar: {
    width: '100%',
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
  },
  txButtons: {
    width: '100%',
    paddingTop: 0,
    paddingBottom: 0,
  },
  multiBalanceContainer: {
    borderBottomRightRadius: 10,
    borderBottomLeftRadius: 10,
    backgroundColor: theme.colors.secondaryGray,
    flexDirection: Platform.select({
      web: 'column',
      android: 'column',
    }),
    width: Platform.select({
      web: '100%',
      android: '100%',
    }),
    justifyContent: 'center',
    alignItems: 'center',
  },
  balanceUsdRow: {
    width: '100%',
  },
  balanceTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexDirection: 'row',
    width: '100%',
  },
  profileContainer: {
    paddingTop: 0,
    paddingBottom: 0,
    alignItems: 'center',
    width: Platform.OS === 'web' ? '20%' : '30%',
  },
  profileAndWalletChat: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
  },
  profileIconContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  multiBalance: {
    display: 'flex',
    flexDirection: 'row',
    width: Platform.select({
      web: '100%',
      android: 179,
    }),
    height: 54,
    justifyContent: 'center',
  },
  buttonSpacer: {
    width: theme.sizes.defaultQuadruple,
  },
})

Dashboard.navigationOptions = ({ navigation, screenProps }) => ({
  navigationBar: () => <TabsView goTo={navigation.navigate} routes={screenProps.routes} navigation={navigation} />,
  title: 'Wallet',
  disableScroll: true,
})

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

  Settings,

  // PP: PrivacyPolicy,
  // PrivacyArticle,
  TOU: PrivacyPolicyAndTerms,
  Statistics,
  Recover: Mnemonics,
  OutOfGasError,
  Rewards: Invite,
  HandlePaymentLink,
  WalletConnect,
})
