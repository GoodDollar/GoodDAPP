// @flow
import React, { useEffect, useState } from 'react'
import { Animated, AppState, Dimensions, Easing } from 'react-native'
import debounce from 'lodash/debounce'
import _get from 'lodash/get'
import moment from 'moment'
import type { Store } from 'undux'
import * as web3Utils from 'web3-utils'
import { delay } from '../../lib/utils/async'
import normalize from '../../lib/utils/normalizeText'
import GDStore from '../../lib/undux/GDStore'
import API from '../../lib/API/api'
import SimpleStore from '../../lib/undux/SimpleStore'
import { useDialog, useErrorDialog } from '../../lib/undux/utils/dialog'
import { PAGE_SIZE } from '../../lib/undux/utils/feed'
import { executeWithdraw } from '../../lib/undux/utils/withdraw'
import { weiToMask } from '../../lib/wallet/utils'
import {
  WITHDRAW_STATUS_COMPLETE,
  WITHDRAW_STATUS_PENDING,
  WITHDRAW_STATUS_UNKNOWN,
} from '../../lib/wallet/GoodWalletClass'

import { createStackNavigator } from '../appNavigation/stackNavigation'

import userStorage from '../../lib/gundb/UserStorage'
import goodWallet from '../../lib/wallet/GoodWallet'
import { PushButton } from '../appNavigation/PushButton'
import TabsView from '../appNavigation/TabsView'
import Avatar from '../common/view/Avatar'
import BigGoodDollar from '../common/view/BigGoodDollar'
import ClaimButton from '../common/buttons/ClaimButton'
import Section from '../common/layout/Section'
import Wrapper from '../common/layout/Wrapper'
import logger from '../../lib/logger/pino-logger'
import { FAQ, PrivacyArticle, PrivacyPolicy, Support, TermsOfUse } from '../webView/webViewInstances'
import { withStyles } from '../../lib/styles'
import Mnemonics from '../signin/Mnemonics'
import { extractQueryParams, readCode } from '../../lib/share'
import { deleteAccountDialog } from '../sidemenu/SideMenuPanel'
import config from '../../config/config'
import LoadingIcon from '../common/modal/LoadingIcon'
import RewardsTab from './Rewards'
import MarketTab from './Marketplace'
import Amount from './Amount'
import Claim from './Claim'
import FeedList from './FeedList'
import FeedModalList from './FeedModalList'
import OutOfGasError from './OutOfGasError'
import Reason from './Reason'
import Receive from './Receive'
import Who from './Who'
import ReceiveSummary from './ReceiveSummary'
import Confirmation from './Confirmation'
import SendByQR from './SendByQR'
import ReceiveByQR from './ReceiveByQR'
import SendConfirmation from './SendConfirmation'
import SendLinkSummary from './SendLinkSummary'
import SendQRSummary from './SendQRSummary'
import { ACTION_SEND } from './utils/sendReceiveFlow'
import { routeAndPathForCode } from './utils/routeAndPathForCode'

// import FaceRecognition from './FaceRecognition/FaceRecognition'
// import FRIntro from './FaceRecognition/FRIntro'
// import FRError from './FaceRecognition/FRError'
// import UnsupportedDevice from './FaceRecognition/UnsupportedDevice'

const log = logger.child({ from: 'Dashboard' })
const MIN_BALANCE_VALUE = '100000'
const GAS_CHECK_DEBOUNCE_TIME = 1000
const showOutOfGasError = debounce(
  async props => {
    const gasResult = await goodWallet.verifyHasGas(web3Utils.toWei(MIN_BALANCE_VALUE, 'gwei'), {
      topWallet: false,
    })
    log.debug('outofgaserror:', { gasResult })
    if (gasResult.ok === false && gasResult.error !== false) {
      props.screenProps.navigateTo('OutOfGasError')
    }
  },
  GAS_CHECK_DEBOUNCE_TIME,
  {
    leading: true,
  }
)

export type DashboardProps = {
  navigation: any,
  screenProps: any,
  store: Store,
  styles?: any,
}
const Dashboard = props => {
  const [animValue] = useState(new Animated.Value(1))
  const store = SimpleStore.useStore()
  const gdstore = GDStore.useStore()
  const [showDialog, hideDialog] = useDialog()
  const [showErrorDialog] = useErrorDialog()
  const { params } = props.navigation.state
  const [update, setUpdate] = useState(0)
  const [showDelayedTimer, setShowDelayedTimer] = useState()
  const currentFeed = store.get('currentFeed')
  const currentScreen = store.get('currentScreen')
  const loadingIndicator = store.get('loadingIndicator')
  const { screenProps, styles }: DashboardProps = props
  const { balance, entitlement } = gdstore.get('account')
  const { avatar, fullName } = gdstore.get('profile')
  const [feeds, setFeeds] = useState([])
  const [headerLarge, setHeaderLarge] = useState(true)
  const scale = {
    transform: [
      {
        scale: animValue,
      },
    ],
  }

  const checkBonusesToRedeem = () => {
    log.info('Check bonuses process started')

    const isUserWhitelisted = gdstore.get('isLoggedInCitizen')

    if (!isUserWhitelisted) {
      return
    }

    return API.redeemBonuses()
      .then(res => {
        log.debug('redeemBonuses', { resData: res && res.data })
      })
      .catch(err => {
        log.error('Failed to redeem bonuses', err.message, err)

        // showErrorDialog('Something Went Wrong. An error occurred while trying to redeem bonuses')
      })
  }

  const prepareLoginToken = async () => {
    log.info('Prepare login token process started')
    const loginToken = await userStorage.getProfileFieldValue('loginToken')

    if (!loginToken) {
      try {
        const response = await API.getLoginToken()

        const _loginToken = _get(response, 'data.loginToken')

        await userStorage.setProfileField('loginToken', _loginToken, 'private')
      } catch (e) {
        log.error('prepareLoginToken failed', e.message, e)
      }
    }
  }

  const checkBonusInterval = async perform => {
    const lastTimeBonusCheck = await userStorage.userProperties.get('lastBonusCheckDate')
    log.debug({ lastTimeBonusCheck })
    if (
      lastTimeBonusCheck &&
      moment()
        .subtract(Number(config.backgroundReqsInterval), 'minutes')
        .isBefore(moment(lastTimeBonusCheck))
    ) {
      return
    }
    await checkBonusesToRedeem()

    userStorage.userProperties.set('lastBonusCheckDate', new Date().toISOString())
  }

  const isTheSameUser = code => {
    return String(code.address).toLowerCase() === goodWallet.account.toLowerCase()
  }

  const checkCode = async anyParams => {
    try {
      if (anyParams && anyParams.code) {
        const { screenProps } = props
        const code = readCode(decodeURI(anyParams.code))
        if (isTheSameUser(code) === false) {
          try {
            const { route, params } = await routeAndPathForCode('send', code)
            screenProps.push(route, params)
          } catch (e) {
            showErrorDialog('Paymnet link is incorrect. Please double check your link.', null, {
              onDismiss: screenProps.goToRoot,
            })
          }
        }
      }
    } catch (e) {
      log.error('checkCode unexpected error:', e.message, e)
    }
  }

  const handleDeleteRedirect = () => {
    if (props.navigation.state.key === 'Delete') {
      deleteAccountDialog({ API, showDialog: showErrorDialog, store, theme: props.theme })
    }
  }

  const getFeedPage = async (reset = false) => {
    const res =
      (await userStorage
        .getFormattedEvents(PAGE_SIZE, reset)
        .catch(e => logger.error('getInitialFeed -> ', e.message, e))) || []
    if (res.length == 0) {
      return
    }
    if (reset) {
      setFeeds(res)
    } else {
      setFeeds(feeds.concat(res))
    }
  }
  const subscribeToFeed = () => {
    return new Promise((res, rej) => {
      userStorage.feed.get('byid').on(async data => {
        log.debug('gun getFeed callback', { data })
        await getFeedPage(true).catch(e => rej(false))
        res(true)
      }, true)
    })
  }

  const handleReceiveLink = () => {
    const anyParams = extractQueryParams(window.location.href)
    if (anyParams && anyParams.paymentCode) {
      props.navigation.state.params = anyParams
    } else {
      checkCode(anyParams)
    }
  }

  const handleAppFocus = state => {
    if (state === 'active') {
      checkBonusInterval()
      showOutOfGasError(props)
      animateClaim()
    }
  }

  const animateClaim = () => {
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
  }

  const showDelayed = () => {
    const id = setTimeout(() => {
      //wait until not loading and not showing other modal (see use effect)
      //mark as displayed
      setShowDelayedTimer(true)
      store.set('addWebApp')({ show: true })
    }, 1000)
    setShowDelayedTimer(id)
  }

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

  const nextFeed = () => {
    if (feeds && feeds.length > 0) {
      log.debug('getNextFeed called')
      return getFeedPage()
    }
  }

  const initDashboard = async () => {
    await subscribeToFeed().catch(e => log.error('initDashboard feed failed', e.message, e))
    log.debug('initDashboard subscribed to feed')
    prepareLoginToken()
    handleDeleteRedirect()
    handleReceiveLink()
    handleResize()
    checkBonusInterval()
    showOutOfGasError(props)
    animateClaim()
  }

  useEffect(() => {
    log.debug('Dashboard didmount')
    initDashboard()
    AppState.addEventListener('change', handleAppFocus)

    return function() {
      AppState.removeEventListener('change', handleAppFocus)
    }
  }, [])

  useEffect(() => {
    log.debug('handle links effect dashboard', { params })
    if (params && params.paymentCode) {
      handleWithdraw()
    } else if (params && params.event) {
      showNewFeedEvent(params.event)
    }
  }, [params])

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

  const showEventModal = currentFeed => {
    store.set('currentFeed')(currentFeed)
  }

  const handleFeedSelection = (receipt, horizontal) => {
    showEventModal(horizontal ? receipt : null)
  }

  const showNewFeedEvent = async eventId => {
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
  }

  const handleWithdraw = async () => {
    const { paymentCode, reason } = props.navigation.state.params
    const { styles }: DashboardProps = props
    try {
      showDialog({
        title: 'Processing Payment Link...',
        image: <LoadingIcon />,
        message: 'please wait while processing...',
        buttons: [{ text: 'YAY!', style: styles.disabledButton }],
      })
      const { status, transactionHash } = await executeWithdraw(store, decodeURI(paymentCode), decodeURI(reason))
      if (transactionHash) {
        hideDialog()
        return
      }
      switch (status) {
        case WITHDRAW_STATUS_COMPLETE:
          showErrorDialog('Payment already withdrawn or canceled by sender')
          break
        case WITHDRAW_STATUS_UNKNOWN: {
          for (let activeAttempts = 0; activeAttempts < 3; activeAttempts++) {
            // eslint-disable-next-line no-await-in-loop
            await delay(2000)
            // eslint-disable-next-line no-await-in-loop
            const { status } = await goodWallet.getWithdrawDetails(decodeURI(paymentCode))
            if (status === WITHDRAW_STATUS_PENDING) {
              // eslint-disable-next-line no-await-in-loop
              return await handleWithdraw()
            }
          }
          showErrorDialog(`Could not find payment details.\nCheck your link or try again later.`)
        }
      }
    } catch (e) {
      log.error('withdraw failed:', e.code, e.message, e)
      showErrorDialog(e.message)
    } finally {
      props.navigation.setParams({ paymentCode: undefined, code: undefined, reason: undefined })
    }
  }

  return (
    <Wrapper style={styles.dashboardWrapper}>
      <Section style={[styles.topInfo]}>
        {headerLarge ? (
          <Section.Stack alignItems="center">
            <Avatar onPress={() => screenProps.push('Profile')} size={68} source={avatar} style={[styles.avatarBig]} />
            <Section.Text color="gray80Percent" fontFamily="slab" fontSize={18}>
              {fullName || ' '}
            </Section.Text>
            <Section.Row style={styles.bigNumberWrapper}>
              <BigGoodDollar
                number={balance}
                bigNumberProps={{ fontSize: 42, fontWeight: 'semibold' }}
                bigNumberUnitStyles={styles.bigNumberUnitStyles}
              />
            </Section.Row>
          </Section.Stack>
        ) : (
          <Section style={[styles.userInfo, styles.userInfoHorizontal]}>
            <Avatar
              onPress={() => screenProps.push('Profile')}
              size={42}
              source={avatar}
              style={[styles.avatarSmall]}
            />
            <BigGoodDollar number={balance} />
          </Section>
        )}
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
              nextRoutes: ['Amount', 'Reason', 'SendLinkSummary', 'SendConfirmation'],
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
        onEndReached={nextFeed}
        updateData={() => {}}
        onScroll={({ nativeEvent }) => {
          // Replicating Header Height.
          // TODO: Improve this when doing animation
          const HEIGHT_FULL =
            props.theme.sizes.defaultDouble +
            68 +
            props.theme.sizes.default +
            normalize(18) +
            props.theme.sizes.defaultDouble * 2 +
            normalize(42) +
            normalize(70)
          const HEIGHT_BASE = props.theme.sizes.defaultDouble + 68 + props.theme.sizes.default + normalize(70)

          const HEIGHT_DIFF = HEIGHT_FULL - HEIGHT_BASE
          const scrollPos = nativeEvent.contentOffset.y
          const scrollPosAlt = headerLarge ? scrollPos - HEIGHT_DIFF : scrollPos + HEIGHT_DIFF
          const newHeaderLarge = scrollPos <= HEIGHT_BASE || scrollPosAlt <= HEIGHT_BASE

          // log.info('scrollPos', { newHeaderLarge, scrollPos, scrollPosAlt, HEIGHT_DIFF, HEIGHT_BASE, HEIGHT_FULL })
          if (newHeaderLarge !== headerLarge) {
            setHeaderLarge(newHeaderLarge)
          }
        }}
        headerLarge={headerLarge}
      />
      {currentFeed && (
        <FeedModalList
          data={feeds}
          handleFeedSelection={handleFeedSelection}
          initialNumToRender={PAGE_SIZE}
          onEndReached={nextFeed}
          selectedFeed={currentFeed}
          updateData={() => {}}
          navigation={props.navigation}
        />
      )}
    </Wrapper>
  )
}

const getStylesFromProps = ({ theme }) => ({
  dashboardWrapper: {
    backgroundImage: 'none',
    backgroundColor: theme.colors.lightGray,
    flexGrow: 1,
    paddingLeft: 0,
    paddingRight: 0,
    paddingTop: 0,
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
  avatarBig: {
    marginBottom: theme.sizes.default,
  },
  avatarSmall: {
    borderRadius: '50%',
    height: 42,
    margin: 0,
    width: 42,
  },
  buttonsRow: {
    alignItems: 'center',
    height: 70,
    justifyContent: 'space-between',
    marginBottom: 0,
    marginTop: 0,
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
    marginRight: 16,
  },
  rightButtonText: {
    marginLeft: 16,
  },
  bigNumberWrapper: {
    marginVertical: theme.sizes.defaultDouble,
    alignItems: 'baseline',
  },
  disabledButton: {
    backgroundColor: theme.colors.gray50Percent,
  },
  bigNumberUnitStyles: {
    marginRight: normalize(-20),
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
  ReceiveSummary,
  Confirmation: {
    screen: Confirmation,
    path: ':action/Confirmation',
  },
  SendLinkSummary,
  SendConfirmation,
  SendByQR,
  ReceiveByQR,

  // FRError,
  // FaceVerification: FaceRecognition,
  // FRIntro,
  // UnsupportedDevice,
  SendQRSummary,
  PP: PrivacyPolicy,
  PrivacyArticle,
  TOU: TermsOfUse,
  Support,
  FAQ,
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
})
