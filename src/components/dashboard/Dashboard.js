// @flow
import React, { Component } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { ScrollView } from 'react-native-web'
import { normalize } from 'react-native-elements'
import type { Store } from 'undux'

import GDStore from '../../lib/undux/GDStore'
import { getInitialFeed, getNextFeed, PAGE_SIZE } from '../../lib/undux/utils/feed'
import { weiToMask } from '../../lib/wallet/utils'
import { createStackNavigator, PushButton } from '../appNavigation/stackNavigation'
import TabsView from '../appNavigation/TabsView'
import { Avatar, BigGoodDollar, Section, Wrapper } from '../common'
import Amount from './Amount'
import Claim from './Claim'
import FaceRecognition from './FaceRecognition'
import FeedList from './FeedList'
import Reason from './Reason'
import Receive from './Receive'
import ReceiveAmount from './ReceiveAmount'
import SendByQR from './SendByQR'
import ReceiveByQR from './ReceiveByQR'
import Send from './Send'
import SendConfirmation from './SendConfirmation'
import SendLinkSummary from './SendLinkSummary'
import SendQRSummary from './SendQRSummary'

import Withdraw from './Withdraw'

export type DashboardProps = {
  screenProps: any,
  navigation: any,
  store: Store
}

type DashboardState = {
  params: {
    receiveLink: string,
    reason?: string
  },
  horizontal: boolean,
  feeds: any[]
}

class Dashboard extends Component<DashboardProps, DashboardState> {
  state = {
    params: {},
    horizontal: false,
    feeds: []
  }

  componentDidMount() {
    const { params } = this.props.navigation.state

    if (params && params.receiveLink) {
      console.log({ params })
      this.setState({ params })
    }

    this.getFeeds()
  }

  getFeeds() {
    getInitialFeed(this.props.store)
  }

  render() {
    const { params, horizontal } = this.state
    const { screenProps, navigation, store }: DashboardProps = this.props
    const { balance, entitlement } = store.get('account')
    const { avatar, fullName } = store.get('profile')
    const feeds = store.get('feeds')

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
            fixedHeight
            virtualized
            data={feeds}
            updateData={() => {}}
            initialNumToRender={PAGE_SIZE}
            onEndReached={getNextFeed.bind(null, store)}
          />
        </Wrapper>
        {params.receiveLink ? <Withdraw params={params} {...this.props} onFail={screenProps.goToRoot} /> : null}
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
