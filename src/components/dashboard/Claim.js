// @flow
import React, { Component } from 'react'
import goodWallet from '../../lib/wallet/GoodWallet'
import { StyleSheet, Text, View } from 'react-native'
import { normalize } from 'react-native-elements'
import { createStackNavigator, PushButton } from '../appNavigation/stackNavigation'
import type { DashboardProps, DashboardState } from './Dashboard'
import logger from '../../lib/logger/pino-logger'

const log = logger.child({ from: 'Claim' })

type ClaimState = DashboardState

type ClaimProps = DashboardProps & {
  entitlement: string
}

class Claim extends Component<ClaimProps, ClaimState> {
  static navigationOptions = { title: 'Claim GD' }

  state = {
    canClaim: false,
    entitlement: '0'
  }

  eventHandlers: any

  async componentDidMount(): Promise<void> {
    let entitlement =
      this.props.entitlement !== undefined ? this.props.entitlement : await goodWallet.checkEntitlement()

    const balance = await goodWallet.balanceOf().catch(e => {
      console.log(e)
      return 0
    })

    this.eventHandlers = goodWallet.balanceChanged((err, event) => {
      console.log('balanceChanged', { err, event })
    })

    this.setState({ canClaim: !!+entitlement, entitlement, balance })
  }

  render() {
    const { screenProps, navigation }: ClaimProps = this.props
    const { canClaim, entitlement } = this.state

    return (
      <View>
        <View>
          <Text>John Doe</Text>
          <Text>{this.state.balance} GD</Text>
        </View>
        <View>
          <Text>YOUR DAILY INCOME: 5 GD</Text>
          <View>
            <Text>Graph</Text>
          </View>
        </View>
        <View>
          <Text>367K PEOPLE CLAIMED 2.5M GD TODAY!</Text>
        </View>
        <View>
          <Text>DAYS TO CLAIM YOUR INCOME:</Text>
          <Text>3/7</Text>
          <Text>NEXT DAILY INCOME:</Text>
          <Text>23:59:59</Text>
        </View>
        <View>
          <PushButton
            disabled={!canClaim}
            routeName={'FaceRecognition'}
            screenProps={screenProps}
            style={[styles.buttonLayout, styles.signUpButton]}
          >
            <Text style={[styles.buttonText]}>CLAIM YOUR SHARE - {`\n${entitlement}`} GD</Text>
          </PushButton>
        </View>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  buttonLayout: {
    marginTop: 30,
    padding: 10
  },
  buttonText: {
    fontFamily: 'Helvetica, "sans-serif"',
    fontSize: normalize(16),
    color: 'white',
    fontWeight: 'bold'
  },
  signUpButton: {
    backgroundColor: '#555555'
  }
})

export default Claim
