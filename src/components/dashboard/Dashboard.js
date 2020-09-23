// @flow
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Animated, Dimensions, Easing, Image, InteractionManager, Platform, TouchableOpacity, View } from 'react-native'
import { debounce, get } from 'lodash'
import type { Store } from 'undux'
import AsyncStorage from '../../lib/utils/asyncStorage'
import { isBrowser } from '../../lib/utils/platform'
import { fireEvent } from '../../lib/analytics/analytics'
import { delay } from '../../lib/utils/async'
import normalize from '../../lib/utils/normalizeText'
import GDStore from '../../lib/undux/GDStore'
import API from '../../lib/API/api'
import SimpleStore, { assertStore } from '../../lib/undux/SimpleStore'
import { useDialog, useErrorDialog } from '../../lib/undux/utils/dialog'
import { PAGE_SIZE } from '../../lib/undux/utils/feed'
import { executeWithdraw } from '../../lib/undux/utils/withdraw'
import { weiToMask } from '../../lib/wallet/utils'
import {
  WITHDRAW_STATUS_COMPLETE,
  WITHDRAW_STATUS_PENDING,
  WITHDRAW_STATUS_UNKNOWN,
} from '../../lib/wallet/GoodWalletClass'
import { initBGFetch } from '../../lib/notifications/backgroundFetch'

import { createStackNavigator } from '../appNavigation/stackNavigation'
import { initTransferEvents } from '../../lib/undux/utils/account'

import userStorage from '../../lib/gundb/UserStorage'
import goodWallet from '../../lib/wallet/GoodWallet'
import useAppState from '../../lib/hooks/useAppState'
import { PushButton } from '../appNavigation/PushButton'
import TabsView from '../appNavigation/TabsView'
import BigGoodDollar from '../common/view/BigGoodDollar'
import ClaimButton from '../common/buttons/ClaimButton'
import Section from '../common/layout/Section'
import Wrapper from '../common/layout/Wrapper'
import logger from '../../lib/logger/pino-logger'
import { decorate, ExceptionCategory, ExceptionCode } from '../../lib/logger/exceptions'
import { Statistics, Support } from '../webView/webViewInstances'
import { withStyles } from '../../lib/styles'
import Mnemonics from '../signin/Mnemonics'
import { parsePaymentLinkParams, readCode } from '../../lib/share'
import useDeleteAccountDialog from '../../lib/hooks/useDeleteAccountDialog'
import config from '../../config/config'
import LoadingIcon from '../common/modal/LoadingIcon'
import SuccessIcon from '../common/modal/SuccessIcon'
import { getDesignRelativeHeight, getMaxDeviceWidth, measure } from '../../lib/utils/sizes'
import { theme as _theme } from '../theme/styles'
import DeepLinking from '../../lib/utils/deepLinking'
import UnknownProfileSVG from '../../assets/unknownProfile.svg'
import useOnPress from '../../lib/hooks/useOnPress'
import PrivacyPolicyAndTerms from './PrivacyPolicyAndTerms'
import RewardsTab from './Rewards'
import MarketTab from './Marketplace'
import Amount from './Amount'
import Claim from './Claim'
import FeedList from './FeedList'
import FeedModalList from './FeedModalList'
import OutOfGasError from './OutOfGasError'
import Reason from './Reason'
import Receive from './Receive'

// import MagicLinkInfo from './MagicLinkInfo'
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

import FaceVerification from './FaceVerification/screens/VerificationScreen'
import FaceVerificationIntro from './FaceVerification/screens/IntroScreen'
import FaceVerificationError from './FaceVerification/screens/ErrorScreen'

const log = logger.child({ from: 'Dashboard' })

let didRender = false
const screenWidth = getMaxDeviceWidth()
const initialHeaderContentWidth = screenWidth - _theme.sizes.default * 2 * 2
const initialAvatarCenteredPosition = initialHeaderContentWidth / 2 - 34

export type DashboardProps = {
  navigation: any,
  screenProps: any,
  store: Store,
  styles?: any,
}

const Dashboard = props => {
  const balanceRef = useRef()
  const { screenProps, styles, theme, navigation }: DashboardProps = props
  const [balanceBlockWidth, setBalanceBlockWidth] = useState(70)
  const [showBalance, setShowBalance] = useState(false)
  const [headerContentWidth, setHeaderContentWidth] = useState(initialHeaderContentWidth)
  const [headerHeightAnimValue] = useState(new Animated.Value(165))
  const [headerAvatarAnimValue] = useState(new Animated.Value(68))
  const [headerAvatarLeftAnimValue] = useState(new Animated.Value(initialAvatarCenteredPosition))
  const [headerBalanceRightAnimValue] = useState(new Animated.Value(initialAvatarCenteredPosition))
  const [avatarCenteredPosition, setAvatarCenteredPosition] = useState(initialAvatarCenteredPosition)
  const [headerBalanceVerticalMarginAnimValue] = useState(new Animated.Value(theme.sizes.defaultDouble))
  const [headerFullNameOpacityAnimValue] = useState(new Animated.Value(1))
  const [animValue] = useState(new Animated.Value(1))
  const store = SimpleStore.useStore()
  const gdstore = GDStore.useStore()
  const [showDialog, hideDialog] = useDialog()
  const [showErrorDialog] = useErrorDialog()
  const showDeleteAccountDialog = useDeleteAccountDialog({ API, showErrorDialog, store, theme })
  const [update, setUpdate] = useState(0)
  const [showDelayedTimer, setShowDelayedTimer] = useState()
  const currentFeed = store.get('currentFeed')
  const currentScreen = store.get('currentScreen')
  const loadingIndicator = store.get('loadingIndicator')
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

  const calculateHeaderLayoutSizes = useCallback(() => {
    const newScreenWidth = getMaxDeviceWidth()
    const newHeaderContentWidth = newScreenWidth - _theme.sizes.default * 2 * 2
    const newAvatarCenteredPosition = newHeaderContentWidth / 2 - 34

    setHeaderContentWidth(newHeaderContentWidth)
    setAvatarCenteredPosition(newAvatarCenteredPosition)
  }, [setHeaderContentWidth, setAvatarCenteredPosition])

  const isTheSameUser = code => {
    return String(code.address).toLowerCase() === goodWallet.account.toLowerCase()
  }

  const checkCode = useCallback(
    async anyParams => {
      try {
        if (anyParams && anyParams.code) {
          const code = readCode(decodeURIComponent(anyParams.code))

          if (isTheSameUser(code) === false) {
            try {
              const { route, params } = await routeAndPathForCode('send', code)
              screenProps.push(route, params)
            } catch (e) {
              log.error('Payment link is incorrect', e.message, e, {
                code,
                category: ExceptionCategory.Human,
                dialogShown: true,
              })
              showErrorDialog('Payment link is incorrect. Please double check your link.', undefined, {
                onDismiss: screenProps.goToRoot,
              })
            }
          }
        }
      } catch (e) {
        log.error('checkCode unexpected error:', e.message, e)
      }
    },
    [screenProps, showErrorDialog],
  )

  const handleDeleteRedirect = useCallback(() => {
    if (navigation.state.key === 'Delete') {
      showDeleteAccountDialog()
    }
  }, [navigation, showDeleteAccountDialog])

  const getFeedPage = useCallback(
    debounce(
      async (reset = false) => {
        log.debug('getFeedPage:', { reset, feeds, loadAnimShown, didRender })
        const feedPromise = userStorage
          .getFormattedEvents(PAGE_SIZE, reset)
          .catch(e => log.error('getInitialFeed failed:', e.message, e))

        if (reset) {
          // a flag used to show feed load animation only at the first app loading
          //subscribeToFeed calls this method on mount effect without dependencies because currently we dont want it re-subscribe
          //so we use a global variable
          if (!didRender) {
            log.debug('waiting for feed animation')

            // a time to perform feed load animation till the end
            await delay(2000)
            didRender = true
          }
          const res = (await feedPromise) || []
          log.debug('getFeedPage getFormattedEvents result:', { res })
          res.length > 0 && !didRender && store.set('feedLoadAnimShown')(true)
          res.length > 0 && setFeeds(res)
        } else {
          const res = (await feedPromise) || []
          res.length > 0 && setFeeds(feeds.concat(res))
        }
      },
      500,
      { leading: true },
    ),
    [loadAnimShown, store, setFeeds, feeds],
  )

  //subscribeToFeed probably should be an effect that updates the feed items
  //as they come in, currently on each new item it simply reset the feed
  //currently it seems too complicated to make it its own effect as it both depends on "feeds" and changes them
  //which would lead to many unwanted subscribe/unsubscribe to gun
  const subscribeToFeed = async () => {
    await getFeedPage(true)

    userStorage.feedEvents.on('updated', onFeedUpdated)
  }

  const onFeedUpdated = event => {
    log.debug('feed cache updated', { event })
    getFeedPage(true)
  }

  const handleAppLinks = () => {
    const { params } = DeepLinking

    log.debug('handle links effect dashboard', { params })

    const { paymentCode, event } = params

    if (paymentCode) {
      handleWithdraw(params)
    } else if (event) {
      showNewFeedEvent(params)
    } else {
      checkCode(params)
    }
  }

  useEffect(() => {
    if (appState === 'active') {
      animateClaim()
    }
  }, [appState])

  const animateClaim = useCallback(async () => {
    const inQueue = await userStorage.userProperties.get('claimQueueAdded')

    if (inQueue && inQueue.status === 'pending') {
      return
    }

    const entitlement = await goodWallet
      .checkEntitlement()
      .then(_ => _.toNumber())
      .catch(e => 0)

    if (entitlement) {
      Animated.sequence([
        Animated.timing(animValue, {
          toValue: 1.4,
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
  }, [animValue])

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

  const nextFeed = useCallback(
    debounce(
      () => {
        if (feeds && feeds.length > 0) {
          log.debug('getNextFeed called')
          return getFeedPage()
        }
      },
      500,
      { leading: true },
    ),
    [feeds, getFeedPage],
  )

  const initDashboard = async () => {
    await userStorage.initRegistered()
    handleDeleteRedirect()
    await subscribeToFeed().catch(e => log.error('initDashboard feed failed', e.message, e))
    initTransferEvents(gdstore)

    log.debug('initDashboard subscribed to feed')

    InteractionManager.runAfterInteractions(handleAppLinks)
    Dimensions.addEventListener('change', handleResize)

    initBGFetch()
  }

  useEffect(() => {
    saveBalanceBlockWidth()
  }, [balance])

  // The width of the balance block required to place the balance block at the center of the screen
  // The balance always changes so the width is dynamical.
  // Animation functionality requires positioning props to be set with numbers.
  // So we need to calculate the center of the screen within dynamically changed balance block width.
  const saveBalanceBlockWidth = useCallback(async () => {
    const { current: balanceView } = balanceRef

    if (!balanceView) {
      return
    }

    const { width } = await measure(balanceView)
    const balanceCenteredPosition = headerContentWidth / 2 - width / 2

    setBalanceBlockWidth(width)

    Animated.timing(headerBalanceRightAnimValue, {
      toValue: balanceCenteredPosition,
      duration: 50,
    }).start()

    if (!showBalance) {
      setShowBalance(true)
    }
  }, [setBalanceBlockWidth, showBalance, setShowBalance, headerContentWidth, headerBalanceRightAnimValue])

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
  }, [headerLarge, balance, update, headerContentWidth, avatarCenteredPosition])

  useEffect(() => {
    log.debug('Dashboard didmount', navigation)
    initDashboard()

    return function() {
      Dimensions.removeEventListener('change', handleResize)
      userStorage.feedEvents.off('updated', onFeedUpdated)
    }
  }, [])

  /**
   * dont show delayed items such as add to home popup if some other dialog is showing
   */
  useEffect(() => {
    const showingSomething = get(currentScreen, 'dialogData.visible') || get(loadingIndicator, 'loading') || currentFeed

    if (showDelayedTimer !== true && showDelayedTimer && showingSomething) {
      setShowDelayedTimer(clearTimeout(showDelayedTimer))
    } else if (!showDelayedTimer) {
      showDelayed()
    }
  }, [get(currentScreen, 'dialogData.visible'), get(loadingIndicator, 'loading'), currentFeed])

  const showEventModal = useCallback(
    currentFeed => {
      store.set('currentFeed')(currentFeed)
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
    if (feeds.length) {
      getNotificationItem()
    }
  }, [feeds, appState])

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
    [showDialog, showEventModal],
  )

  const handleWithdraw = useCallback(
    async params => {
      const paymentParams = parsePaymentLinkParams(params)

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
          paymentParams.reason,
        )

        if (transactionHash) {
          fireEvent('WITHDRAW')

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

        const withdrawnOrSendError = 'Payment already withdrawn or canceled by sender'
        const wrongPaymentDetailsError = 'Wrong payment link or payment details'
        switch (status) {
          case WITHDRAW_STATUS_COMPLETE:
            log.error('Failed to complete withdraw', withdrawnOrSendError, new Error(withdrawnOrSendError), {
              status,
              transactionHash,
              paymentParams,
              category: ExceptionCategory.Human,
              dialogShown: true,
            })
            showErrorDialog(withdrawnOrSendError)
            break
          case WITHDRAW_STATUS_UNKNOWN:
            for (let activeAttempts = 0; activeAttempts < 3; activeAttempts++) {
              // eslint-disable-next-line no-await-in-loop
              await delay(2000)
              // eslint-disable-next-line no-await-in-loop
              const { status } = await goodWallet.getWithdrawDetails(paymentParams.paymentCode)
              if (status === WITHDRAW_STATUS_PENDING) {
                // eslint-disable-next-line no-await-in-loop
                return await handleWithdraw(params)
              }
            }
            log.error('Could not find payment details', wrongPaymentDetailsError, new Error(wrongPaymentDetailsError), {
              status,
              transactionHash,
              paymentParams,
              category: ExceptionCategory.Human,
              dialogShown: true,
            })
            showErrorDialog(`Could not find payment details.\nCheck your link or try again later.`)
            break
          default:
            break
        }
      } catch (exception) {
        const { message } = exception
        let uiMessage = decorate(exception, ExceptionCode.E4)

        if (message.includes('own payment')) {
          uiMessage = message
        }

        log.error('withdraw failed:', message, exception, { dialogShown: true })
        showErrorDialog(uiMessage)
      } finally {
        navigation.setParams({ paymentCode: undefined })
      }
    },
    [showDialog, hideDialog, showErrorDialog, store, navigation],
  )

  // const avatarSource = useMemo(() => (avatar ? { uri: avatar } : UnknownProfile), [avatar])

  const onScroll = useCallback(
    ({ nativeEvent }) => {
      const minScrollRequired = 150
      const scrollPosition = nativeEvent.contentOffset.y
      const minScrollRequiredISH = headerLarge ? minScrollRequired : minScrollRequired * 2
      const scrollPositionISH = headerLarge ? scrollPosition : scrollPosition + minScrollRequired
      if (feeds && feeds.length && feeds.length > 10 && scrollPositionISH > minScrollRequiredISH) {
        if (headerLarge) {
          setHeaderLarge(false)
        }
      } else {
        if (!headerLarge) {
          setHeaderLarge(true)
        }
      }
    },
    [headerLarge, feeds, setHeaderLarge],
  )

  const modalListData = useMemo(() => (isBrowser ? [currentFeed] : feeds), [currentFeed, feeds])

  const goToProfile = useOnPress(() => screenProps.push('Profile'), [screenProps])

  return (
    <Wrapper style={styles.dashboardWrapper} withGradient={false}>
      <Section style={[styles.topInfo]}>
        <Animated.View style={headerAnimateStyles}>
          <Section.Stack alignItems="center" style={styles.headerWrapper}>
            <Animated.View style={avatarAnimStyles}>
              <TouchableOpacity onPress={goToProfile} style={styles.avatarWrapper}>
                {avatar ? (
                  <Image source={{ uri: avatar }} style={styles.avatar} />
                ) : (
                  <View style={styles.avatar}>
                    <UnknownProfileSVG />
                  </View>
                )}
              </TouchableOpacity>
            </Animated.View>
            <Animated.View style={[styles.headerFullName, fullNameAnimateStyles]}>
              <Section.Text color="gray80Percent" fontFamily="slab" fontSize={18}>
                {fullName || ' '}
              </Section.Text>
            </Animated.View>
            <Animated.View style={[styles.bigNumberWrapper, balanceAnimStyles]}>
              <View ref={balanceRef}>
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
              </View>
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
          <ClaimButton
            screenProps={screenProps}
            amount={weiToMask(entitlement, { showUnits: true })}
            animated
            animatedScale={scale}
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
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: getDesignRelativeHeight(10),
    zIndex: -1,
  },
  dashboardWrapper: {
    backgroundColor: theme.colors.lightGray,
    flexGrow: 1,
    padding: 0,
  },
  topInfo: {
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    marginLeft: theme.sizes.default,
    marginRight: theme.sizes.default,
    paddingBottom: theme.sizes.default,
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
  marginNegative: {
    marginBottom: -7,
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

  FaceVerification,
  FaceVerificationIntro,
  FaceVerificationError,

  SendQRSummary,

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
  Rewards: {
    screen: RewardsTab,
    path: 'Rewards/:rewardsPath*',
  },
  Marketplace: {
    screen: config.market ? MarketTab : WrappedDashboard,
    path: 'Marketplace/:marketPath*',
  },

  // MagicLinkInfo,
})
