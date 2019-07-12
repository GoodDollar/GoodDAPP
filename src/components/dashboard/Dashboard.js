// @flow
import React, { useEffect, useState } from 'react'
import { StyleSheet, View } from 'react-native'
import normalize from 'react-native-elements/src/helpers/normalizeText'
import { Portal } from 'react-native-paper'
import type { Store } from 'undux'

import GDStore from '../../lib/undux/GDStore'
import SimpleStore from '../../lib/undux/SimpleStore'
import { useDialog } from '../../lib/undux/utils/dialog'
import { getInitialFeed, getNextFeed, PAGE_SIZE } from '../../lib/undux/utils/feed'
import { executeWithdraw } from '../../lib/undux/utils/withdraw'
import { weiToMask } from '../../lib/wallet/utils'
import { createStackNavigator } from '../appNavigation/stackNavigation'
import { PushButton } from '../appNavigation/PushButton'
import TabsView from '../appNavigation/TabsView'
import { Avatar, BigGoodDollar, ClaimButton, Section, Wrapper } from '../common'
import logger from '../../lib/logger/pino-logger'
import userStorage from '../../lib/gundb/UserStorage'
import { PrivacyPolicy, Support, TermsOfUse } from '../webView/webViewInstances'
import Amount from './Amount'
import Claim from './Claim'
import FaceRecognition from './FaceRecognition/FaceRecognition'
import FeedList from './FeedList'
import FeedModalItem from './FeedItems/FeedModalItem'
import Reason from './Reason'
import Receive from './Receive'
import ReceiveFrom from './ReceiveFrom'
import ReceiveAmount from './ReceiveAmount'
import SendByQR from './SendByQR'
import ReceiveByQR from './ReceiveByQR'
import Send from './Send'
import SendConfirmation from './SendConfirmation'
import SendLinkSummary from './SendLinkSummary'
import SendQRSummary from './SendQRSummary'

const log = logger.child({ from: 'Dashboard' })

export type DashboardProps = {
  screenProps: any,
  navigation: any,
  store: Store,
}

type DashboardState = {
  horizontal: boolean,
  feeds: any[],
  currentFeedProps: any,
}

const Dashboard = props => {
  const store = SimpleStore.useStore()
  const gdstore = GDStore.useStore()
  const [showDialog, hideDialog] = useDialog()
  const [state: DashboardState, setState] = useState({
    horizontal: false,
    currentFeedProps: null,
    feeds: [],
  })
  const { params } = props.navigation.state

  useEffect(() => {
    log.debug('Dashboard didmount')
    userStorage.feed.get('byid').on(data => {
      log.debug('gun getFeed callback', { data })
      getFeeds()
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

  const getFeeds = () => {
    getInitialFeed(gdstore)
  }

  const showEventModal = item => {
    setState({
      currentFeedProps: {
        item,
        styles: {
          flex: 1,
          alignSelf: 'flex-start',
          height: '100vh',
          position: 'absolute',
          width: '100%',
          paddingTop: normalize(30),
          paddingBottom: normalize(30),
          paddingLeft: normalize(10),
          paddingRight: normalize(10),
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
        },
        onPress: closeFeedEvent,
      },
    })
  }

  const handleFeedSelection = (receipt, horizontal) => {
    showEventModal(receipt)
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

  const closeFeedEvent = () => {
    setState({ currentFeedProps: null })
  }

  const handleWithdraw = async () => {
    const { paymentCode, reason } = props.navigation.state.params
    try {
      showDialog({ title: 'Processing Payment Link...', loading: true, dismissText: 'hold' })
      await executeWithdraw(store, paymentCode, reason)
      hideDialog()

      // if (receipt.transactionHash) {
      //   await showNewFeedEvent(receipt.transactionHash)
      // }
    } catch (e) {
      showDialog({ title: 'Error', message: e.message })
    }
  }

  const { horizontal, currentFeedProps } = state
  const { screenProps, navigation }: DashboardProps = props
  const { balance, entitlement } = gdstore.get('account')
  const { avatar, fullName } = gdstore.get('profile')
  const feeds = gdstore.get('feeds')

  // TODO: Calculate scroll position to update Dashboard avatar, name and gd amount view
  const scrollPos = 100

  log.info('LOGGER FEEDS', { feeds })
  return (
    <View style={styles.dashboardView}>
      <TabsView goTo={navigation.navigate} routes={screenProps.routes} />
      <Wrapper backgroundColor="#EEE">
        <Section>
          {scrollPos < 100 ? (
            <>
              <Section.Row justifyContent="center" alignItems="baseline">
                <Avatar size={80} source={avatar} onPress={() => screenProps.push('Profile')} />
              </Section.Row>
              <Section.Row justifyContent="center" alignItems="baseline">
                <Section.Title>{fullName || ' '}</Section.Title>
              </Section.Row>
              <Section.Row justifyContent="center" alignItems="baseline">
                <BigGoodDollar number={balance} />
              </Section.Row>
            </>
          ) : (
            <Section.Row>
              <Section.Stack alignItems="flex-start">
                <Avatar size={42} source={avatar} onPress={() => screenProps.push('Profile')} />
              </Section.Stack>
              <Section.Stack alignItems="flex-end">
                <BigGoodDollar number={balance} />
              </Section.Stack>
            </Section.Row>
          )}
          <Section.Row style={styles.buttonsRow} alignItems="stretch">
            <PushButton
              routeName={'Send'}
              screenProps={screenProps}
              style={styles.leftButton}
              icon="send"
              iconAlignment="left"
            >
              Send
            </PushButton>
            <ClaimButton screenProps={screenProps} amount={weiToMask(entitlement, { showUnits: true })} />
            <PushButton
              routeName={'Receive'}
              screenProps={screenProps}
              style={styles.rightButton}
              icon="receive"
              iconAlignment="right"
            >
              Receive
            </PushButton>
          </Section.Row>
        </Section>
        <View style={styles.marginTop}>
          <FeedList
            horizontal={horizontal}
            handleFeedSelection={handleFeedSelection}
            fixedHeight
            virtualized
            data={feeds}
            updateData={() => {}}
            initialNumToRender={PAGE_SIZE}
            onEndReached={getNextFeed.bind(null, store)}
          />
        </View>
        {currentFeedProps && (
          <Portal>
            <FeedModalItem {...currentFeedProps} />
          </Portal>
        )}
      </Wrapper>
    </View>
  )
}

const styles = StyleSheet.create({
  buttonsRow: {
    marginVertical: normalize(8),
  },
  leftButton: {
    flex: 1,
    marginRight: normalize(16),
    paddingRight: normalize(16),
  },
  rightButton: {
    flex: 1,
    marginLeft: normalize(16),
    paddingLeft: normalize(16),
  },
  dashboardView: {
    flex: 1,
  },
  marginTop: {
    marginTop: normalize(8),
  },
  centering: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
    height: '256px',
  },
})

Dashboard.navigationOptions = {
  navigationBarHidden: true,
  title: 'Home',
}

export default createStackNavigator({
  Home: Dashboard,
  Claim,
  Receive,
  ReceiveFrom,
  Amount,
  Reason,
  ReceiveAmount,
  Send,
  SendLinkSummary,
  SendConfirmation,
  FaceRecognition,
  SendByQR,
  ReceiveByQR,
  SendQRSummary,
  PP: PrivacyPolicy,
  TOU: TermsOfUse,
  Support,
})
