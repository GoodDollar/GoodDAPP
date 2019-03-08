// @flow
import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { normalize } from 'react-native-elements'

import logger from '../../lib/logger/pino-logger'
import goodWallet from '../../lib/wallet/GoodWallet'
import { AccountConsumer } from '../appNavigation/AccountProvider'
import { createStackNavigator, PushButton } from '../appNavigation/stackNavigation'
import TabsView from '../appNavigation/TabsView'
import { Avatar, BigNumber, Section, Wrapper } from '../common'
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
  navigation: any
}

const log = logger.child({ from: 'Dashboard' })

const withdraw = async otlCode => {
  log.info({ otlCode })
  await goodWallet.ready
  await goodWallet.withdraw(otlCode)
}

const Dashboard = props => {
  const { screenProps, navigation }: DashboardProps = props
  const focused = navigation.isFocused()
  const { state } = navigation
  const param = navigation.getParam('receiveLink', 'no-param')

  if (param !== 'no-param') {
    withdraw(param).then(log.info)
  }

  log.debug({ param, focused, state })

  return (
    <AccountConsumer>
      {({ balance, entitlement }) => (
        <View>
          <TabsView goTo={navigation.navigate} routes={screenProps.routes} />
          <Wrapper>
            <Section>
              <Section.Row style={styles.centered}>
                <Avatar size={80} />
              </Section.Row>
              <Section.Row style={styles.centered}>
                <Section.Title>John Doe</Section.Title>
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
        </View>
      )}
    </AccountConsumer>
  )
}

Dashboard.navigationOptions = {
  navigationBarHidden: true
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

export default createStackNavigator({
  Dashboard,
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
