// @flow
import React, { Component } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import TabsView from './TabsView'
import goodWallet from '../../lib/wallet/GoodWallet'
import logger from '../../lib/logger/pino-logger'
import { normalize } from 'react-native-elements'
import { Button } from 'react-native-paper'

const log = logger.child({ from: 'Dashboard' })

export type DashboardState = {
  canClaim: boolean,
  entitlement: string
}

export type DashboardProps = {
  screenProps: any,
  navigation: any
}

class Dashboard extends Component<DashboardProps, DashboardState> {
  state = {
    canClaim: false,
    entitlement: '0'
  }

  async componentDidMount(): Promise<void> {
    const entitlement = await goodWallet.checkEntitlement()

    this.setState({
      canClaim: !!+entitlement,
      entitlement
    })
  }

  navigateTo = (route: string) => {
    this.props.navigation.navigate(route)
  }

  render() {
    const { screenProps, navigation }: DashboardProps = this.props
    const { canClaim, entitlement } = this.state

    return (
      <View>
        <TabsView goTo={navigation.navigate} routes={screenProps.routes} />
        <Text>Dashboard</Text>
        <Button
          disabled={!canClaim}
          onPress={() => this.navigateTo('Claim')}
          style={[styles.buttonLayout, styles.signUpButton, !canClaim ? styles.buttonDisabled : {}]}
        >
          <Text style={[styles.buttonText]}>CLAIM</Text>
          {'\n'}
          <Text style={[styles.buttonText, styles.grayedOutText]}>+{entitlement} GD</Text>
        </Button>
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
  },
  grayedOutText: {
    color: '#d5d5d5'
  }
})

export default Dashboard
