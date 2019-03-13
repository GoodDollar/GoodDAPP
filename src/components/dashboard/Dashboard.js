// @flow
import React, { Component } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { normalize } from 'react-native-elements'
import type { Store } from 'undux'

import type { TransactionEvent } from '../../lib/gundb/UserStorage'
import UserStorage from '../../lib/gundb/UserStorage'
import logger from '../../lib/logger/pino-logger'
import GDStore from '../../lib/undux/GDStore'
import goodWallet from '../../lib/wallet/GoodWallet'
import { createStackNavigator, PushButton } from '../appNavigation/stackNavigation'
import TabsView from '../appNavigation/TabsView'
import { Avatar, BigNumber, CustomDialog, Section, Wrapper } from '../common'
import Splash from '../splash/Splash'
import Amount from './Amount'
import Claim from './Claim'
import FaceRecognition from './FaceRecognition'
import Reason from './Reason'
import Receive from './Receive'
import ReceiveAmount from './ReceiveAmount'
import ScanQR from './ScanQR'
import Send from './Send'
import SendConfirmation from './SendConfirmation'
import SendLinkSummary from './SendLinkSummary'
import SendQRSummary from './SendQRSummary'

export type DashboardProps = {
  screenProps: any,
  navigation: any,
  store: Store
}

type DashboardState = {
  loading: boolean,
  dialogData: {
    visible: boolean,
    title?: string,
    message?: string
  }
}

const log = logger.child({ from: 'Dashboard' })

class Dashboard extends Component<DashboardProps, DashboardState> {
  state = {
    loading: true,
    dialogData: { visible: false }
  }

  componentDidMount() {
    const { navigation } = this.props
    const param = navigation.getParam('receiveLink', 'no-param')

    if (param !== 'no-param') {
      this.withdraw(param).then(this.stopLoading)
    } else {
      this.stopLoading()
    }
  }

  async withdraw(hash: string) {
    try {
      const { amount, sender } = await goodWallet.canWithdraw(hash)
      const receipt = await goodWallet.withdraw(hash)

      log.debug({ amount, sender })

      const transactionEvent: TransactionEvent = {
        id: receipt.blockHash,
        date: new Date().toString(),
        type: 'withdraw',
        data: {
          sender,
          amount,
          hash,
          receipt
        }
      }
      await UserStorage.updateFeedEvent(transactionEvent)

      // Cheking events are being stored
      // FIXME: Remove this since is only to check that is working
      const events = await UserStorage.feed.get('2019-03-01').decrypt()
      log.info({ events, transactionEvent })

      this.setState({
        dialogData: { visible: true, title: 'Withdraw Successful', message: `amount: ${amount}GD (from: ${sender})` }
      })
    } catch (e) {
      this.setState({ dialogData: { visible: true, title: 'Error', message: e.message } })
    }
  }

  stopLoading = () => {
    this.setState({ loading: false })
  }

  dismissDialog = () => {
    this.setState({ dialogData: { visible: false } })
  }

  render() {
    const { loading, dialogData } = this.state
    const { screenProps, navigation, store }: DashboardProps = this.props
    const { balance, entitlement } = store.get('account')
    const { fullName } = store.get('name')

    return (
      <>
        {loading ? (
          <Splash />
        ) : (
          <View>
            <TabsView goTo={navigation.navigate} routes={screenProps.routes} />
            <Wrapper>
              <Section>
                <Section.Row style={styles.centered}>
                  <Avatar size={80} />
                </Section.Row>
                <Section.Row style={styles.centered}>
                  <Section.Title>{fullName || 'John Doe'}</Section.Title>
                </Section.Row>
                <Section.Row style={styles.centered}>
                  <BigNumber number={balance} unit="GD" />
                </Section.Row>
                <Section.Row style={styles.buttonRow}>
                  <PushButton routeName={'Send'} screenProps={screenProps} style={styles.leftButton}>
                    Send
                  </PushButton>
                  <PushButton routeName={'Claim'} screenProps={screenProps}>
                    <Text style={[styles.buttonText]}>Claim</Text>
                    <br />
                    <Text style={[styles.buttonText, styles.grayedOutText]}>{entitlement}GD</Text>
                  </PushButton>
                  <PushButton routeName={'Receive'} screenProps={screenProps} style={styles.rightButton}>
                    Receive
                  </PushButton>
                </Section.Row>
              </Section>
            </Wrapper>
            <CustomDialog onDismiss={this.dismissDialog} {...dialogData} />
          </View>
        )}
      </>
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
  centered: {
    justifyContent: 'center',
    alignItems: 'baseline'
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
  ScanQR,
  SendQRSummary
})
