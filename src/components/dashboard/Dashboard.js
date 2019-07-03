// @flow
import React, { useEffect, useState } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import normalize from 'react-native-elements/src/helpers/normalizeText'
import { Portal } from 'react-native-paper'
import type { Store } from 'undux'

import GDStore from '../../lib/undux/GDStore'
import SimpleStore from '../../lib/undux/SimpleStore'
import { useDialog } from '../../lib/undux/utils/dialog'
import { getInitialFeed, getNextFeed, PAGE_SIZE } from '../../lib/undux/utils/feed'
import { executeWithdraw } from '../../lib/undux/utils/withdraw'
import { weiToMask } from '../../lib/wallet/utils'
import { createStackNavigator, PushButton } from '../appNavigation/stackNavigation'
import TabsView from '../appNavigation/TabsView'
import { Avatar, BigGoodDollar, Section, Wrapper } from '../common'
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
  store: Store
}

type DashboardState = {
  horizontal: boolean,
  feeds: any[],
  currentFeedProps: any
}

const Dashboard = props => {
  const store = SimpleStore.useStore()
  const gdstore = GDStore.useStore()
  const [showDialog, hideDialog] = useDialog()
  const [state: DashboardState, setState] = useState({
    horizontal: false,
    currentFeedProps: null,
    feeds: []
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

  // componentWillUnmount() {
  //   // TODO: we should be removing the listener in unmount but this causes that you cannot re-subscribe
  //   // userStorage.feed.get('byid').off()
  // }

  const getFeeds = () => {
    getInitialFeed(gdstore)
  }

  const showEventModal = item => {
    // props.screenProps.navigateTo('Home', {
    //   event: item.id,
    //   receiveLink: undefined,
    //   reason: undefined
    // })
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
          backgroundColor: 'rgba(0, 0, 0, 0.7)'
        },
        onPress: closeFeedEvent
      }
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
          message: 'Event does not exist'
        })
      }
    } catch (e) {
      showDialog({
        title: 'Error',
        message: 'Event does not exist'
      })
    }
  }

  const closeFeedEvent = () => {
    setState({
      currentFeedProps: null
    })
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

  log.info('LOGGER FEEDS', { feeds })

  return (
    <View style={styles.dashboardView}>
      <TabsView goTo={navigation.navigate} routes={screenProps.routes} />
      <Wrapper backgroundColor="#eeeeee">
        <Section>
          <Section.Row style={styles.centered}>
            <Avatar size={80} source={avatar} onPress={() => screenProps.push('Profile')} />
          </Section.Row>
          <Section.Row style={styles.centered}>
            <Section.Title>{fullName || ' '}</Section.Title>
          </Section.Row>
          <Section.Row style={styles.centered}>
            <BigGoodDollar number={balance} />
          </Section.Row>
          <Section.Row style={styles.buttonRow}>
            <PushButton routeName={'Send'} screenProps={screenProps} style={styles.leftButton}>
              Send
            </PushButton>
            <PushButton routeName={'Claim'} screenProps={screenProps}>
              <Text style={[styles.buttonText]}>Claim</Text>
              <br />
              <Text style={[styles.buttonText, styles.grayedOutText]}>
                +{weiToMask(entitlement, { showUnits: true })}
              </Text>
            </PushButton>
            <PushButton routeName={'Receive'} screenProps={screenProps} style={styles.rightButton}>
              Receive
            </PushButton>
          </Section.Row>
        </Section>
        <FeedList
          horizontal={horizontal}
          handleFeedSelection={handleFeedSelection}
          fixedHeight
          virtualized
          data={feeds}
          updateData={() => {}}
          initialNumToRender={PAGE_SIZE}
          onEndReached={getNextFeed.bind(null, gdstore)}
        />
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
  buttonText: {
    fontSize: normalize(16),
    color: 'white',
    fontWeight: 'bold',
    textTransform: 'uppercase'
  },
  buttonRow: {
    alignItems: 'stretch',
    marginTop: normalize(10)
  },
  grayedOutText: {
    color: '#d5d5d5',
    fontSize: normalize(10)
  },
  leftButton: {
    flex: 1,
    marginRight: normalize(10)
  },
  rightButton: {
    flex: 1,
    marginLeft: normalize(10)
  },
  dashboardView: {
    flex: 1
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'baseline'
  },
  centering: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
    height: '256px'
  }
})

Dashboard.navigationOptions = {
  navigationBarHidden: true,
  title: 'Home'
}

export default createStackNavigator({
  Home: Dashboard,
  Claim,
  Receive,
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
  Support
})
