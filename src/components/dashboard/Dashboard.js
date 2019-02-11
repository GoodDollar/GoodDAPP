// @flow
import React, { Component } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import TabsView from '../appNavigation/TabsView'
import goodWallet from '../../lib/wallet/GoodWallet'
import logger from '../../lib/logger/pino-logger'
import { normalize } from 'react-native-elements'
import { createStackNavigator, PushButton } from '../appNavigation/stackNavigation'
import Claim from './Claim'
import FaceRecognition from './FaceRecognition'
import Receive from './Receive'
import Send from './Send'

import { Wrapper, Section, Avatar, BigNumber } from '../common'

const log = logger.child({ from: 'Dashboard' })

export type DashboardState = {
  balance?: number,
  entitlement: string
}

export type DashboardProps = {
  screenProps: any,
  navigation: any
}

class Dashboard extends Component<DashboardProps, DashboardState> {
  state = {
    balance: undefined,
    entitlement: '0'
  }

  static navigationOptions = {
    navigationBarHidden: true
  }

  async componentDidMount(): Promise<void> {
    try {
      const entitlement = await goodWallet.checkEntitlement()
      const balance = await goodWallet.balanceOf()
      this.setState({
        entitlement,
        balance
      })
    } catch (e) {
      console.log(e)
    }
  }

  navigateTo = (route: string) => {
    this.props.navigation.navigate(route)
  }

  render() {
    const { screenProps, navigation }: DashboardProps = this.props
    const { balance, entitlement } = this.state

    return (
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
              <PushButton routeName={'Send'} screenProps={this.props.screenProps} style={styles.leftButton}>
                Send
              </PushButton>
              <PushButton routeName={'Claim'} screenProps={this.props.screenProps}>
                <Text style={[styles.buttonText]}>Claim</Text>
                <br />
                <Text style={[styles.buttonText, styles.grayedOutText]}>{entitlement}GD</Text>
              </PushButton>
              <PushButton routeName={'Receive'} screenProps={this.props.screenProps} style={styles.rightButton}>
                Receive
              </PushButton>
            </Section.Row>
          </Section>
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
  centered: {
    justifyContent: 'center',
    alignItems: 'baseline'
  }
})

export default createStackNavigator({
  Dashboard,
  Claim,
  Receive,
  Send,
  FaceRecognition
})
