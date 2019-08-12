// @flow
import React, { useEffect, useState } from 'react'
import type { Store } from 'undux'
import normalize from '../../lib/utils/normalizeText'
import GDStore from '../../lib/undux/GDStore'
import SimpleStore from '../../lib/undux/SimpleStore'
import { useDialog, useErrorDialog } from '../../lib/undux/utils/dialog'
import { getInitialFeed, getNextFeed, PAGE_SIZE } from '../../lib/undux/utils/feed'
import { executeWithdraw } from '../../lib/undux/utils/withdraw'
import { weiToMask } from '../../lib/wallet/utils'
import { createStackNavigator } from '../appNavigation/stackNavigation'
import { PushButton } from '../appNavigation/PushButton'
import TabsView from '../appNavigation/TabsView'
import Avatar from '../common/view/Avatar'
import BigGoodDollar from '../common/view/BigGoodDollar'
import ClaimButton from '../common/buttons/ClaimButton'
import Section from '../common/layout/Section'
import Wrapper from '../common/layout/Wrapper'
import logger from '../../lib/logger/pino-logger'
import userStorage from '../../lib/gundb/UserStorage'
import { FAQ, PrivacyArticle, PrivacyPolicy, Support, TermsOfUse } from '../webView/webViewInstances'
import { withStyles } from '../../lib/styles'
import Mnemonics from '../signin/Mnemonics'
import Amount from './Amount'
import Claim from './Claim'
import FaceRecognition from './FaceRecognition/FaceRecognition'
import FRIntro from './FaceRecognition/FRIntro'
import FRError from './FaceRecognition/FRError'
import UnsupportedDevice from './FaceRecognition/UnsupportedDevice'
import FeedList from './FeedList'
import FeedModalList from './FeedModalList'
import Reason from './Reason'
import Receive from './Receive'
import Who from './Who'
import ReceiveSummary from './ReceiveSummary'
import Confirmation from './Confirmation'
import SendByQR from './SendByQR'
import ReceiveByQR from './ReceiveByQR'
import Send from './Send'
import SendConfirmation from './SendConfirmation'
import SendLinkSummary from './SendLinkSummary'
import SendQRSummary from './SendQRSummary'
import { ACTION_SEND } from './utils/sendReceiveFlow'

const log = logger.child({ from: 'Dashboard' })

export type DashboardProps = {
  navigation: any,
  screenProps: any,
  store: Store,
  styles?: any,
}
const Dashboard = props => {
  const store = SimpleStore.useStore()
  const gdstore = GDStore.useStore()
  const [showDialog, hideDialog] = useDialog()
  const [showErrorDialog] = useErrorDialog()
  const { params } = props.navigation.state

  useEffect(() => {
    log.debug('Dashboard didmount')
    userStorage.feed.get('byid').on(data => {
      log.debug('gun getFeed callback', { data })
      getInitialFeed(gdstore)
    }, true)
  }, [])

  useEffect(() => {
    log.debug('handle links effect dashboard', { params })
    if (params && params.paymentCode) {
      handleWithdraw()
    } else if (params && params.event) {
      showNewFeedEvent(params.event)
    }
  }, [params])

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
    try {
      showDialog({ title: 'Processing Payment Link...', loading: true, dismissText: 'hold' })
      await executeWithdraw(store, paymentCode, reason)
      hideDialog()
    } catch (e) {
      showErrorDialog(e)
    }
  }

  const currentFeed = store.get('currentFeed')
  const { screenProps, styles }: DashboardProps = props
  const { balance, entitlement } = gdstore.get('account')
  const { avatar, fullName } = gdstore.get('profile')
  const feeds = gdstore.get('feeds')
  const [scrollPos, setScrollPos] = useState(0)
  log.info('LOGGER FEEDS', { props })
  log.info('scrollPos', { scrollPos })

  return (
    <Wrapper style={styles.dashboardWrapper}>
      <Section style={[styles.topInfo]}>
        {scrollPos <= 0 ? (
          <Section.Stack alignItems="center">
            <Avatar onPress={() => screenProps.push('Profile')} size={68} source={avatar} style={[styles.avatarBig]} />
            <Section.Text style={[styles.userName]}>{fullName || ' '}</Section.Text>
            <Section.Row style={styles.bigNumberWrapper}>
              <BigGoodDollar bigNumberStyles={styles.bigNumberVerticalStyles} number={balance} unit={undefined} />
              <Section.Text style={styles.bigNumberUnitStyles}>G$</Section.Text>
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
            <BigGoodDollar bigNumberStyles={styles.bigNumberStyles} number={balance} />
          </Section>
        )}
        <Section.Row style={styles.buttonsRow}>
          <PushButton
            icon="send"
            iconAlignment="left"
            routeName="Who"
            screenProps={screenProps}
            style={styles.leftButton}
            contentStyle={styles.leftButtonContent}
            textStyle={styles.leftButtonText}
            params={{
              nextRoutes: ['Amount', 'Reason', 'SendLinkSummary', 'SendConfirmation'],
              params: { action: 'Send' },
            }}
          >
            Send
          </PushButton>
          <ClaimButton screenProps={screenProps} amount={weiToMask(entitlement, { showUnits: true })} />
          <PushButton
            icon="receive"
            iconAlignment="right"
            routeName={'Receive'}
            screenProps={screenProps}
            style={styles.rightButton}
            contentStyle={styles.rightButtonContent}
            textStyle={styles.rightButtonText}
          >
            Receive
          </PushButton>
        </Section.Row>
      </Section>
      <FeedList
        data={feeds}
        handleFeedSelection={handleFeedSelection}
        initialNumToRender={PAGE_SIZE}
        onEndReached={getNextFeed.bind(null, store)}
        updateData={() => {}}
        onScroll={({ nativeEvent }) => {
          setScrollPos(nativeEvent.contentOffset.y)
        }}
      />
      {currentFeed && (
        <FeedModalList
          data={feeds}
          handleFeedSelection={handleFeedSelection}
          initialNumToRender={PAGE_SIZE}
          onEndReached={getNextFeed.bind(null, store)}
          selectedFeed={currentFeed}
          updateData={() => {}}
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
  userName: {
    color: theme.colors.gray80Percent,
    fontFamily: theme.fonts.slab,
    fontSize: normalize(18),
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
    marginRight: 16,
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
    marginLeft: 16,
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
  bigNumberVerticalStyles: {
    fontFamily: theme.fonts.slab,
    fontSize: normalize(42),
    fontWeight: '600',
  },
  bigNumberWrapper: {
    marginVertical: theme.sizes.defaultDouble,
    alignItems: 'baseline',
  },
  bigNumberStyles: {
    fontFamily: theme.fonts.slab,
    fontSize: normalize(36),
    fontWeight: '700',
  },
  bigNumberUnitStyles: {
    marginRight: normalize(-20),
    fontFamily: theme.fonts.slab,
    fontSize: normalize(18),
    fontWeight: '700',
  },
})

Dashboard.navigationOptions = ({ navigation, screenProps }) => {
  return {
    navigationBar: () => <TabsView goTo={navigation.navigate} routes={screenProps.routes} />,
    title: 'Home',
    disableScroll: true,
  }
}

const WrappedDashboard = withStyles(getStylesFromProps)(Dashboard)

export default createStackNavigator({
  Home: WrappedDashboard,
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
  Send,
  SendLinkSummary,
  SendConfirmation,
  FRError,
  FaceVerification: FaceRecognition,
  FRIntro,
  UnsupportedDevice,
  SendByQR,
  ReceiveByQR,
  SendQRSummary,
  PP: PrivacyPolicy,
  PrivacyArticle,
  TOU: TermsOfUse,
  Support,
  FAQ,
  Recover: Mnemonics,
})
