// @flow
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Animated, Dimensions, Easing, Image, InteractionManager, Platform, TouchableOpacity } from 'react-native'
import { isBrowser } from 'mobile-device-detect'
import { get as _get, debounce } from 'lodash'
import type { Store } from 'undux'
import { fireEvent } from '../../lib/analytics/analytics'
import { delay } from '../../lib/utils/async'
import normalize from '../../lib/utils/normalizeText'
import GDStore from '../../lib/undux/GDStore'
import API from '../../lib/API/api'
import SimpleStore from '../../lib/undux/SimpleStore'
import { useDialog, useErrorDialog } from '../../lib/undux/utils/dialog'
import { PAGE_SIZE } from '../../lib/undux/utils/feed'
import { executeWithdraw, prepareDataWithdraw } from '../../lib/undux/utils/withdraw'
import { weiToMask } from '../../lib/wallet/utils'
import {
  WITHDRAW_STATUS_COMPLETE,
  WITHDRAW_STATUS_PENDING,
  WITHDRAW_STATUS_UNKNOWN,
} from '../../lib/wallet/GoodWalletClass'

import { createStackNavigator } from '../appNavigation/stackNavigation'

import { getMaxDeviceWidth } from '../../lib/utils/Orientation'
import userStorage from '../../lib/gundb/UserStorage'
import goodWallet from '../../lib/wallet/GoodWallet'
import { PushButton } from '../appNavigation/PushButton'
import TabsView from '../appNavigation/TabsView'
import BigGoodDollar from '../common/view/BigGoodDollar'
import ClaimButton from '../common/buttons/ClaimButton'
import Section from '../common/layout/Section'
import Wrapper from '../common/layout/Wrapper'
import logger from '../../lib/logger/pino-logger'
import { PrivacyArticle, PrivacyPolicyAndTerms, Statistics, Support } from '../webView/webViewInstances'
import { withStyles } from '../../lib/styles'
import Mnemonics from '../signin/Mnemonics'
import { extractQueryParams, readCode } from '../../lib/share'
import useDeleteAccountDialog from '../../lib/hooks/useDeleteAccountDialog'
import useAppState from '../../lib/hooks/useAppState'
import config from '../../config/config'
import LoadingIcon from '../common/modal/LoadingIcon'
import SuccessIcon from '../common/modal/SuccessIcon'
import { getDesignRelativeHeight } from '../../lib/utils/sizes'
import { theme as _theme } from '../theme/styles'
import unknownProfile from '../../assets/unknownProfile.svg'
import RewardsTab from './Rewards'
import MarketTab from './Marketplace'
import Amount from './Amount'
import Claim from './Claim'
import FeedList from './FeedList'
import FeedModalList from './FeedModalList'
import OutOfGasError from './OutOfGasError'
import Reason from './Reason'
import Receive from './Receive'
import MagicLinkInfo from './MagicLinkInfo'
import Who from './Who'
import ReceiveSummary from './ReceiveSummary'
import ReceiveToAddress from './ReceiveToAddress'
import TransactionConfirmation from './TransactionConfirmation'
import SendToAddress from './SendToAddress'
import SendByQR from './SendByQR'
import ReceiveByQR from './ReceiveByQR'
import SendLinkSummary from './SendLinkSummary'
import SendQRSummary from './SendQRSummary'
import { ACTION_SEND } from './utils/sendReceiveFlow'
import { routeAndPathForCode } from './utils/routeAndPathForCode'
import ServiceWorkerUpdatedDialog from './ServiceWorkerUpdatedDialog'

//import ReceiveConfirmation from './ReceiveConfirmation'
// import SendConfirmation from './SendConfirmation'

// import FaceRecognition from './FaceRecognition/FaceRecognition'
// import FRIntro from './FaceRecognition/FRIntro'
// import FRError from './FaceRecognition/FRError'
// import UnsupportedDevice from './FaceRecognition/UnsupportedDevice'

const log = logger.child({ from: 'Dashboard' })

const screenWidth = getMaxDeviceWidth()
const headerContentWidth = screenWidth - _theme.sizes.default * 2 * 2
const avatarCenteredPosition = headerContentWidth / 2 - 34

export type DashboardProps = {
  navigation: any,
  screenProps: any,
  store: Store,
  styles?: any,
}
const Dashboard = props => {
  const { screenProps, styles, theme, navigation }: DashboardProps = props
  const [getNextFeedAllowed, setGetNextFeedAllowed] = useState(true)
  const [balanceBlockWidth, setBalanceBlockWidth] = useState(70)
  const [showBalance, setShowBalance] = useState(false)
  const [headerHeightAnimValue] = useState(new Animated.Value(165))
  const [headerAvatarAnimValue] = useState(new Animated.Value(68))
  const [headerAvatarLeftAnimValue] = useState(new Animated.Value(avatarCenteredPosition))
  const [headerBalanceRightAnimValue] = useState(new Animated.Value(avatarCenteredPosition))
  const [headerBalanceVerticalMarginAnimValue] = useState(new Animated.Value(theme.sizes.defaultDouble))
  const [headerFullNameOpacityAnimValue] = useState(new Animated.Value(1))
  const [animValue] = useState(new Animated.Value(1))
  const store = SimpleStore.useStore()
  const gdstore = GDStore.useStore()
  const [showDialog, hideDialog] = useDialog()
  const [showErrorDialog] = useErrorDialog()
  const showDeleteAccountDialog = useDeleteAccountDialog({ API, showDialog: showErrorDialog, store, theme })
  const [update, setUpdate] = useState(0)
  const [showDelayedTimer, setShowDelayedTimer] = useState()
  const currentFeed = store.get('currentFeed')
  const currentScreen = store.get('currentScreen')
  const loadingIndicator = store.get('loadingIndicator')
  const serviceWorkerUpdated = store.get('serviceWorkerUpdated')
  const loadAnimShown = store.get('feedLoadAnimShown')
  const { balance, entitlement } = gdstore.get('account')
  const { avatar, fullName } = gdstore.get('profile')
  const [feeds, setFeeds] = useState([])
  const [headerLarge, setHeaderLarge] = useState(true)
  const { appState } = useAppState()
  const scale = {
    transform: [
      {
        scale: animValue,
      },
    ],
  }
  const headerAnimateStyles = {
    position: 'relative',
    height: headerHeightAnimValue,
  }
  const fullNameAnimateStyles = {
    opacity: headerFullNameOpacityAnimValue,
  }
  const avatarAnimStyles = {
    position: 'absolute',
    height: headerAvatarAnimValue,
    width: headerAvatarAnimValue,
    top: 0,
    left: headerAvatarLeftAnimValue,
  }
  const balanceAnimStyles = {
    visibility: showBalance ? 'visible' : 'hidden',
    position: 'absolute',
    right: headerBalanceRightAnimValue,
    marginVertical: headerBalanceVerticalMarginAnimValue,
  }

  const isTheSameUser = code => {
    return String(code.address).toLowerCase() === goodWallet.account.toLowerCase()
  }

  const checkCode = useCallback(
    async anyParams => {
      try {
        if (anyParams && anyParams.code) {
          const code = readCode(decodeURI(anyParams.code))

          if (isTheSameUser(code) === false) {
            try {
              const { route, params } = await routeAndPathForCode('send', code)
              screenProps.push(route, params)
            } catch (e) {
              showErrorDialog('Paymnet link is incorrect. Please double check your link.', undefined, {
                onDismiss: screenProps.goToRoot,
              })
            }
          }
        }
      } catch (e) {
        log.error('checkCode unexpected error:', e.message, e)
      }
    },
    [screenProps, showErrorDialog]
  )

  const handleDeleteRedirect = useCallback(() => {
    if (navigation.state.key === 'Delete') {
      showDeleteAccountDialog()
    }
  }, [navigation, showDeleteAccountDialog])

  const getFeedPage = useCallback(
    async (reset = false) => {
      const res =
        (await userStorage
          .getFormattedEvents(PAGE_SIZE, reset)
          .catch(e => logger.error('getInitialFeed -> ', e.message, e))) || []

      if (res.length === 0) {
        log.warn('empty feed')
        return
      }

      if (reset) {
        // a flag used to show feed load animation only at the first app loading
        if (!loadAnimShown) {
          // a time to perform feed load animation till the end
          await delay(1900)
          store.set('feedLoadAnimShown')(true)
        }
        setFeeds(res)
      } else {
        setFeeds(feeds.concat(res))
      }
    },
    [loadAnimShown, store, setFeeds, feeds]
  )

  const subscribeToFeed = () => {
    return new Promise((res, rej) => {
      userStorage.feed.get('byid').on(async data => {
        log.debug('gun getFeed callback', { data })
        await getFeedPage(true).catch(e => rej(false))
        res(true)
      }, true)
    })
  }

  const handleAppLinks = () => {
    const anyParams = extractQueryParams(window.location.href)

    log.debug('handle links effect dashboard', { anyParams })

    if (anyParams && anyParams.paymentCode) {
      handleWithdraw(anyParams)
    } else if (anyParams && anyParams.event) {
      showNewFeedEvent(anyParams.event)
    } else {
      checkCode(anyParams)
    }
  }

  useEffect(() => {
    if (appState === 'active') {
      animateClaim()
    }
  }, [appState])

  const animateClaim = useCallback(() => {
    const { entitlement } = gdstore.get('account')

    if (Number(entitlement)) {
      Animated.sequence([
        Animated.timing(animValue, {
          toValue: 1.2,
          duration: 750,
          easing: Easing.ease,
          delay: 1000,
        }),
        Animated.timing(animValue, {
          toValue: 1,
          duration: 750,
          easing: Easing.ease,
        }),
      ]).start()
    }
  }, [gdstore, animValue])

  const showDelayed = useCallback(() => {
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
  const handleResize = () => {
    const debouncedHandleResize = debounce(() => {
      log.info('update component after resize', update)
      setUpdate(Date.now())
    }, 100)

    Dimensions.addEventListener('change', () => debouncedHandleResize())
  }

  const nextFeed = useCallback(() => {
    if (getNextFeedAllowed && feeds && feeds.length > 0) {
      log.debug('getNextFeed called')
      return getFeedPage()
    }
  }, [feeds])

  const initDashboard = async () => {
    await subscribeToFeed().catch(e => log.error('initDashboard feed failed', e.message, e))

    log.debug('initDashboard subscribed to feed')
    handleDeleteRedirect()
    handleResize()
    animateClaim()
    InteractionManager.runAfterInteractions(handleAppLinks)
  }

  // The width of the balance block required to place the balance block at the center of the screen
  // The balance always changes so the width is dynamical.
  // Animation functionality requires positioning props to be set with numbers.
  // So we need to calculate the center of the screen within dynamically changed balance block width.
  const balanceHasBeenCentered = useRef(false)

  const saveBalanceBlockWidth = useCallback(
    event => {
      if (balanceHasBeenCentered.current) {
        return
      }

      const width = _get(event, 'nativeEvent.layout.width')

      setBalanceBlockWidth(width)

      const balanceCenteredPosition = headerContentWidth / 2 - width / 2
      Animated.timing(headerBalanceRightAnimValue, {
        toValue: balanceCenteredPosition,
        duration: 100,
      }).start()

      if (!showBalance) {
        setShowBalance(true)
      }
      balanceHasBeenCentered.current = true
    },
    [setBalanceBlockWidth, headerBalanceRightAnimValue, showBalance, setShowBalance, balanceHasBeenCentered]
  )

  useEffect(() => {
    const timing = 250
    const fullNameOpacityTiming = 150
    const easingIn = Easing.in(Easing.quad)
    const easingOut = Easing.out(Easing.quad)
    const balanceCenteredPosition = headerContentWidth / 2 - balanceBlockWidth / 2

    if (headerLarge) {
      Animated.parallel([
        Animated.timing(headerAvatarAnimValue, {
          toValue: 68,
          duration: timing,
          easing: easingOut,
        }),
        Animated.timing(headerHeightAnimValue, {
          toValue: 165,
          duration: timing,
          easing: easingOut,
        }),
        Animated.timing(headerAvatarLeftAnimValue, {
          toValue: avatarCenteredPosition,
          duration: timing,
          easing: easingOut,
        }),
        Animated.timing(headerFullNameOpacityAnimValue, {
          toValue: 1,
          duration: fullNameOpacityTiming,
          easing: easingOut,
        }),
        Animated.timing(headerBalanceRightAnimValue, {
          toValue: balanceCenteredPosition,
          duration: timing,
          easing: easingOut,
        }),
        Animated.timing(headerBalanceVerticalMarginAnimValue, {
          toValue: theme.sizes.defaultDouble,
          duration: timing,
          easing: easingOut,
        }),
      ]).start()
    } else {
      Animated.parallel([
        Animated.timing(headerAvatarAnimValue, {
          toValue: 42,
          duration: timing,
          easing: easingIn,
        }),
        Animated.timing(headerHeightAnimValue, {
          toValue: 40,
          duration: timing,
          easing: easingIn,
        }),
        Animated.timing(headerAvatarLeftAnimValue, {
          toValue: 0,
          duration: timing,
          easing: easingIn,
        }),
        Animated.timing(headerFullNameOpacityAnimValue, {
          toValue: 0,
          duration: fullNameOpacityTiming,
          easing: easingIn,
        }),
        Animated.timing(headerBalanceRightAnimValue, {
          toValue: 20,
          duration: timing,
          easing: easingIn,
        }),
        Animated.timing(headerBalanceVerticalMarginAnimValue, {
          toValue: 0,
          duration: timing,
          easing: easingIn,
        }),
      ]).start()
    }

    // needed to allow executing getNextFeed fn after header animation ends
    setTimeout(() => setGetNextFeedAllowed(true), 300)
  }, [headerLarge])

  useEffect(() => {
    log.debug('Dashboard didmount', navigation)
    initDashboard()
  }, [])

  /**
   * dont show delayed items such as add to home popup if some other dialog is showing
   */
  useEffect(() => {
    const showingSomething =
      _get(currentScreen, 'dialogData.visible') || _get(loadingIndicator, 'loading') || currentFeed

    if (showDelayedTimer !== true && showDelayedTimer && showingSomething) {
      setShowDelayedTimer(clearTimeout(showDelayedTimer))
    } else if (!showDelayedTimer) {
      showDelayed()
    }
  }, [_get(currentScreen, 'dialogData.visible'), _get(loadingIndicator, 'loading'), currentFeed])

  useEffect(() => {
    if (serviceWorkerUpdated) {
      log.info('service worker updated', serviceWorkerUpdated)
      showDialog({
        showCloseButtons: false,
        content: <ServiceWorkerUpdatedDialog />,
        buttonsContainerStyle: styles.serviceWorkerDialogButtonsContainer,
        buttons: [
          {
            text: 'WHAT’S NEW?',
            mode: 'text',
            color: theme.colors.gray80Percent,
            style: styles.serviceWorkerDialogWhatsNew,
            onPress: () => {
              window.open(config.newVersionUrl, '_blank')
            },
          },
          {
            text: 'UPDATE',
            onPress: () => {
              if (serviceWorkerUpdated && serviceWorkerUpdated.waiting && serviceWorkerUpdated.waiting.postMessage) {
                log.debug('service worker:', 'sending skip waiting', serviceWorkerUpdated.active.clients)
                serviceWorkerUpdated.waiting.postMessage({ type: 'SKIP_WAITING' })
              }
            },
          },
        ],
      })
    }
  }, [serviceWorkerUpdated])

  const showEventModal = useCallback(
    currentFeed => {
      store.set('currentFeed')(currentFeed)
    },
    [store]
  )

  const handleFeedSelection = (receipt, horizontal) => {
    showEventModal(horizontal ? receipt : null)
  }

  const showNewFeedEvent = useCallback(
    async eventId => {
      try {
        const item = await userStorage.getFormatedEventById(eventId)
        log.info('showNewFeedEvent', { eventId, item })
        if (item) {
          showEventModal(item)
        } else {
          showDialog({
            title: 'Error',
            message: 'Event does not exist',
          })
        }
      } catch (e) {
        showDialog({
          title: 'Error',
          message: 'Event does not exist',
        })
      }
    },
    [showDialog]
  )

  const handleWithdraw = useCallback(
    async params => {
      const paymentParams = prepareDataWithdraw(params)

      try {
        showDialog({
          title: 'Processing Payment Link...',
          image: <LoadingIcon />,
          message: 'please wait while processing...',
          buttons: [
            {
              text: 'YAY!',
              style: styles.disabledButton,
              disabled: true,
            },
          ],
        })

        const { status, transactionHash } = await executeWithdraw(
          store,
          paymentParams.paymentCode,
          paymentParams.reason
        )

        if (transactionHash) {
          fireEvent('WITHDRAW')
          hideDialog()
          showDialog({
            title: 'Payment Link Processed Successfully',
            image: <SuccessIcon />,
            message: "You received G$'s!",
            buttons: [
              {
                text: 'YAY!',
              },
            ],
          })
          return
        }

        switch (status) {
          case WITHDRAW_STATUS_COMPLETE:
            showErrorDialog('Payment already withdrawn or canceled by sender')
            break
          case WITHDRAW_STATUS_UNKNOWN:
            for (let activeAttempts = 0; activeAttempts < 3; activeAttempts++) {
              // eslint-disable-next-line no-await-in-loop
              await delay(2000)
              // eslint-disable-next-line no-await-in-loop
              const { status } = await goodWallet.getWithdrawDetails(paymentParams.paymentCode)
              if (status === WITHDRAW_STATUS_PENDING) {
                // eslint-disable-next-line no-await-in-loop
                return await handleWithdraw()
              }
            }
            showErrorDialog(`Could not find payment details.\nCheck your link or try again later.`)
            break
          default:
            break
        }
      } catch (e) {
        log.error('withdraw failed:', e.message, e, { errCode: e.code })
        showErrorDialog(e.message)
      } finally {
        navigation.setParams({ paymentCode: undefined })
      }
    },
    [showDialog, hideDialog, showErrorDialog, store, navigation]
  )

  const avatarSource = useMemo(() => (avatar ? { uri: avatar } : unknownProfile), [avatar])

  const onScroll = useCallback(
    ({ nativeEvent }) => {
      const minScrollRequired = 150
      const scrollPosition = nativeEvent.contentOffset.y
      const minScrollRequiredISH = headerLarge ? minScrollRequired : minScrollRequired * 2
      const scrollPositionISH = headerLarge ? scrollPosition : scrollPosition + minScrollRequired
      if (feeds && feeds.length && feeds.length > 10 && scrollPositionISH > minScrollRequiredISH) {
        headerLarge && setHeaderLarge(false)
      } else {
        !headerLarge && setHeaderLarge(true)
      }
    },
    [headerLarge, feeds]
  )

  const modalListData = useMemo(() => (isBrowser ? [currentFeed] : feeds), [currentFeed, feeds])

  const goToProfile = useCallback(() => screenProps.push('Profile'), [screenProps])

  return (
    <Wrapper style={styles.dashboardWrapper}>
      <Section style={[styles.topInfo]}>
        <Animated.View style={headerAnimateStyles}>
          <Section.Stack alignItems="center" style={styles.headerWrapper}>
            <Animated.View style={avatarAnimStyles}>
              <TouchableOpacity onPress={goToProfile} style={styles.avatarWrapper}>
                <Image source={avatarSource} style={styles.avatar} />
              </TouchableOpacity>
            </Animated.View>
            <Animated.View style={[styles.headerFullName, fullNameAnimateStyles]}>
              <Section.Text color="gray80Percent" fontFamily="slab" fontSize={18}>
                {fullName || ' '}
              </Section.Text>
            </Animated.View>
            <Animated.View onLayout={saveBalanceBlockWidth} style={[styles.bigNumberWrapper, balanceAnimStyles]}>
              <BigGoodDollar
                testID="amount_value"
                number={balance}
                bigNumberProps={{
                  fontSize: 42,
                  fontWeight: 'semibold',
                  lineHeight: 42,
                  textAlign: 'left',
                }}
                style={Platform.OS !== 'web' && styles.marginNegative}
                bigNumberUnitStyles={styles.bigNumberUnitStyles}
              />
            </Animated.View>
          </Section.Stack>
        </Animated.View>
        <Section.Row style={styles.buttonsRow}>
          <PushButton
            icon="send"
            iconAlignment="left"
            routeName="Who"
            iconSize={20}
            screenProps={screenProps}
            style={styles.leftButton}
            contentStyle={styles.leftButtonContent}
            textStyle={styles.leftButtonText}
            params={{
              nextRoutes: ['Amount', 'Reason', 'SendLinkSummary', 'TransactionConfirmation'],
              params: { action: 'Send' },
            }}
            compact
          >
            Send
          </PushButton>
          <Animated.View style={{ zIndex: 1, ...scale }}>
            <ClaimButton screenProps={screenProps} amount={weiToMask(entitlement, { showUnits: true })} />
          </Animated.View>
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
      <FeedList
        data={feeds}
        handleFeedSelection={handleFeedSelection}
        initialNumToRender={PAGE_SIZE}
        onEndReached={nextFeed} // How far from the end the bottom edge of the list must be from the end of the content to trigger the onEndReached callback.
        // we can use decimal (from 0 to 1) or integer numbers. Integer - it is a pixels from the end. Decimal it is the percentage from the end
        onEndReachedThreshold={0.7} // Determines the maximum number of items rendered outside of the visible area
        windowSize={7}
        onScroll={onScroll}
        headerLarge={headerLarge}
        scrollEventThrottle={100}
      />
      {currentFeed && (
        <FeedModalList
          data={modalListData}
          handleFeedSelection={handleFeedSelection}
          initialNumToRender={PAGE_SIZE}
          onEndReached={nextFeed}
          selectedFeed={currentFeed}
          navigation={navigation}
        />
      )}
    </Wrapper>
  )
}

const getStylesFromProps = ({ theme }) => ({
  headerWrapper: {
    height: '100%',
  },
  headerFullName: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    marginVertical: 'auto',
    height: 'fit-content',
    paddingTop: getDesignRelativeHeight(10),
  },
  dashboardWrapper: {
    backgroundImage: 'none',
    backgroundColor: theme.colors.lightGray,
    flexGrow: 1,
    padding: 0,
  },
  topInfo: {
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    marginBottom: 0,
    marginLeft: theme.sizes.default,
    marginRight: theme.sizes.default,
    paddingBottom: theme.sizes.default,
    paddingLeft: theme.sizes.default,
    paddingRight: theme.sizes.default,
    paddingTop: theme.sizes.defaultDouble,
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
    borderRadius: Platform.select({
      web: '50%',
      default: 150 / 2,
    }),
    height: '100%',
    width: '100%',
  },
  buttonsRow: {
    alignItems: 'center',
    height: 70,
    justifyContent: 'space-between',
    marginBottom: 0,
    marginTop: 1,
  },
  leftButton: {
    flex: 1,
    height: 44,
    marginRight: 24,
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
    marginLeft: 24,
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
    alignItems: 'baseline',
    position: 'absolute',
    bottom: 0,
  },
  disabledButton: {
    backgroundColor: theme.colors.gray50Percent,
  },
  bigNumberUnitStyles: {
    marginRight: normalize(-20),
  },
  serviceWorkerDialogWhatsNew: {
    textAlign: 'left',
    fontSize: normalize(14),
  },
  serviceWorkerDialogButtonsContainer: {
    display: 'flex',
    flexDirection: 'row',
    paddingLeft: 0,
    paddingRight: 0,
    paddingTop: theme.sizes.defaultDouble,
    justifyContent: 'space-between',
  },
})

Dashboard.navigationOptions = ({ navigation, screenProps }) => {
  return {
    navigationBar: () => <TabsView goTo={navigation.navigate} routes={screenProps.routes} navigation={navigation} />,
    title: 'Home',
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
  ReceiveByQR,

  /*ReceiveConfirmation: {
    screen: ReceiveConfirmation,
    path: ':action/ReceiveConfirmation',
  },*/

  SendLinkSummary,
  SendByQR,
  SendToAddress,

  // SendConfirmation,

  // FRError,
  // FaceVerification: FaceRecognition,
  // FRIntro,
  // UnsupportedDevice,
  SendQRSummary,

  TransactionConfirmation: {
    screen: TransactionConfirmation,
    path: ':action/TransactionConfirmation',
    params: { action: ACTION_SEND },
  },

  // PP: PrivacyPolicy,
  PrivacyArticle,
  TOU: PrivacyPolicyAndTerms,
  Support,
  Statistics,
  Recover: Mnemonics,
  OutOfGasError,
  Rewards: {
    screen: RewardsTab,
    path: 'Rewards/:rewardsPath*',
  },
  Marketplace: {
    screen: config.market ? MarketTab : WrappedDashboard,
    path: 'Marketplace/:marketPath*',
  },
  MagicLinkInfo,
})
