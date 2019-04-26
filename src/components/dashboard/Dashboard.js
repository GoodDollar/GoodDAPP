// @flow
import React, { Component } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { normalize } from 'react-native-elements'
import { Portal } from 'react-native-paper'
import type { Store } from 'undux'

import GDStore from '../../lib/undux/GDStore'
import { getInitialFeed, getNextFeed, PAGE_SIZE } from '../../lib/undux/utils/feed'
import { executeWithdraw } from '../../lib/undux/utils/withdraw'
import { weiToMask } from '../../lib/wallet/utils'
import { createStackNavigator, PushButton } from '../appNavigation/stackNavigation'
import TabsView from '../appNavigation/TabsView'
import { Avatar, BigGoodDollar, Section, Wrapper } from '../common'
import Amount from './Amount'
import Claim from './Claim'
import FaceRecognition from './FaceRecognition'
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

  componentDidMount() {
    const { params } = this.props.navigation.state

    if (params && params.receiveLink) {
      this.handleWithdraw()
    } else if (params && params.event) {
      this.showNewFeedEvent(params.event)
    } else {
      this.getFeeds()
    }
  }

  getFeeds() {
    getInitialFeed(this.props.store)
  }

  handleFeedSelection = (receipt, horizontal) => {
    this.setState({ horizontal })
  }

  showNewFeedEvent = async event => {
    const item = await userStorage.getStandardizedFeedByTransactionHash(event)
    log.info('ITEM...', { item })
    if (item) {
      this.setState({
        currentFeedProps: {
          item,
          styles: {
            flex: 1,
            alignSelf: 'flex-start',
            height: '90vh',
            position: 'absolute',
            width: '100%',
            padding: normalize(10)
          },
          onPress: this.closeFeedEvent
        }
      })
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
    this.getFeeds()
  }

  closeFeedEvent = () => {
    this.setState(
      {
        currentFeedProps: null
      },
      () => {
        this.getFeeds()
        this.props.screenProps.navigateTo('Home', {
          event: undefined,
          receiveLink: undefined,
          reason: undefined
        })
      }
    )
  }

  handleWithdraw = async () => {
    const { params } = this.props.navigation.state
    const { screenProps, store } = this.props
    const receipt = await executeWithdraw(store, params.receiveLink)
    await this.showNewFeedEvent(receipt.transactionHash)

    screenProps.navigateTo('Home', {
      event: receipt.transactionHash,
      receiveLink: undefined,
      reason: undefined
    })
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
              <Section.Title>{fullName || 'John Doe'}</Section.Title>
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
                  {weiToMask(entitlement, { showUnits: true })}
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
    fontFamily: 'Helvetica, "sans-serif"',
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
  navigationBarHidden: true
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
  SendQRSummary
})
