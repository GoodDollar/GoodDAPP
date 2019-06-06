// @flow
import React, { Component } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import normalize from 'react-native-elements/src/helpers/normalizeText'
import { Portal } from 'react-native-paper'
import type { Store } from 'undux'
import throttle from 'lodash/throttle'

import GDStore from '../../lib/undux/GDStore'
import { getInitialFeed, getNextFeed, PAGE_SIZE } from '../../lib/undux/utils/feed'
import { executeWithdraw } from '../../lib/undux/utils/withdraw'
import { weiToMask } from '../../lib/wallet/utils'
import { createStackNavigator, PushButton } from '../appNavigation/stackNavigation'
import TabsView from '../appNavigation/TabsView'
import { Avatar, BigGoodDollar, Section, Wrapper } from '../common'
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
import logger from '../../lib/logger/pino-logger'
import userStorage from '../../lib/gundb/UserStorage'
import { TermsOfUse, PrivacyPolicy, Support } from '../webView/webViewInstances'

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

class Dashboard extends Component<DashboardProps, DashboardState> {
  state = {
    horizontal: false,
    currentFeedProps: null,
    feeds: []
  }

  componentWillMount() {
    const { params } = this.props.navigation.state
    userStorage.feed.get('byid').on(data => {
      log.debug('gun getFeed callback', { data })
      this.getFeeds()
    }, true)
    if (params && params.receiveLink) {
      this.handleWithdraw()
    } else if (params && params.event) {
      this.showNewFeedEvent(params.event)
    }

    // this.getFeeds()
  }

  componentWillUnmount() {
    // TODO: we should be removing the listener in unmount but this causes that you cannot re-subscribe
    // userStorage.feed.get('byid').off()
  }

  getFeeds = (() => {
    const get = () => {
      log.debug('getFeed initial')
      getInitialFeed(this.props.store)
    }
    return throttle(get, 2000, { leading: true })
  })()

  showEventModal = item => {
    this.props.screenProps.navigateTo('Home', {
      event: item.id,
      receiveLink: undefined,
      reason: undefined
    })
    this.setState({
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
        onPress: this.closeFeedEvent
      }
    })
  }

  handleFeedSelection = (receipt, horizontal) => {
    this.showEventModal(receipt)
  }

  showNewFeedEvent = async eventId => {
    try {
      const item = await userStorage.getFormatedEventById(eventId)
      log.info({ item })
      if (item) {
        this.showEventModal(item)
      } else {
        this.props.store.set('currentScreen')({
          ...this.props.store.get('currentScreen'),
          dialogData: {
            visible: true,
            title: 'Error',
            message: 'Event does not exist'
          }
        })
      }
    } catch (e) {
      this.props.store.set('currentScreen')({
        ...this.props.store.get('currentScreen'),
        dialogData: {
          visible: true,
          title: 'Error',
          message: 'Event does not exist'
        }
      })
    }
  }

  closeFeedEvent = () => {
    this.setState(
      {
        currentFeedProps: null
      },
      () => {
        this.props.screenProps.navigateTo('Home', {
          event: undefined,
          receiveLink: undefined,
          reason: undefined
        })
      }
    )
  }

  handleWithdraw = async () => {
    const { receiveLink, reason } = this.props.navigation.state.params
    const { store } = this.props
    try {
      const receipt = await executeWithdraw(store, receiveLink, reason)
      if (receipt.transactionHash) {
        await this.showNewFeedEvent(receipt.transactionHash)
      }
    } catch (e) {
      log.error(e)
    }
  }

  render() {
    const { horizontal, currentFeedProps } = this.state
    const { screenProps, navigation, store }: DashboardProps = this.props
    const { balance, entitlement } = store.get('account')
    const { avatar, fullName } = store.get('profile')
    const feeds = store.get('feeds')

    log.info('LOGGER FEEDS', { feeds })

    return (
      <View style={styles.dashboardView}>
        <TabsView goTo={navigation.navigate} routes={screenProps.routes} />
        <Wrapper>
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
            handleFeedSelection={this.handleFeedSelection}
            fixedHeight
            virtualized
            data={feeds}
            updateData={() => {}}
            initialNumToRender={PAGE_SIZE}
            onEndReached={getNextFeed.bind(null, store)}
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

const dashboard = GDStore.withStore(Dashboard)

dashboard.navigationOptions = {
  navigationBarHidden: true,
  title: 'Home'
}

export default createStackNavigator({
  Home: dashboard,
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
