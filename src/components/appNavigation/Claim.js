// @flow
import React, { Component } from 'react'
import goodWallet from '../../lib/wallet/GoodWallet'
import { StyleSheet, Text, View } from 'react-native'
import { normalize } from 'react-native-elements'
import { createStackNavigator, PushButton } from './stackNavigation'
import type { DashboardProps, DashboardState } from './Dashboard'
import logger from '../../lib/logger/pino-logger'
import { Description, Title } from '../signup/components'
import { Button, Modal, Portal } from 'react-native-paper'

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

  async componentDidMount(): Promise<void> {
    let entitlement =
      this.props.entitlement !== undefined ? this.props.entitlement : await goodWallet.checkEntitlement()

    this.setState({ canClaim: !!+entitlement, entitlement })
  }

  render() {
    const { screenProps, navigation }: ClaimProps = this.props
    const { canClaim, entitlement } = this.state

    return (
      <View>
        <View>
          <Text>John Doe</Text>
          <Text>2,000 GD</Text>
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

type FRProps = {
  screenProps: any
}
type FRState = {
  displayModal: boolean
}

class FaceRecognition extends React.Component<FRProps, FRState> {
  state = {
    displayModal: false
  }

  handleSubmit = () => {
    this.props.screenProps.doneCallback({ isEmailConfirmed: true })
  }

  logData = e => {
    this.setState({ displayModal: false })
    log.info(e)
  }

  handleClaim = async () => {
    try {
      const hasClaimed = await goodWallet.claim()
      log.info('handleClaim', hasClaimed)

      if (hasClaimed) {
        this.setState({ displayModal: true })
      }
    } catch (e) {
      log.warn(e)
    }
  }

  render() {
    this.props.screenProps.data = { name: 'John' }
    const { displayModal } = this.state
    return (
      <Portal.Host>
        <Title>{`${this.props.screenProps.data.name},\n Just one last thing...`}</Title>
        <Description style={FRstyles.description}>
          {"In order to give you a basic income we need to make sure it's really you"}
        </Description>
        <Button
          onPress={() => this.setState({ displayModal: true })}
          screenProps={this.props.screenProps}
          style={[styles.buttonLayout, styles.signUpButton]}
        >
          <Text style={[styles.buttonText]}>QUICK FACE RECOGNITION</Text>
        </Button>
        <Portal>
          <Modal onDismiss={this.logData} visible={displayModal} dismissable={true}>
            <View style={{ border: '10px solid red', background: 'white' }}>
              <Text>SUCCESS!</Text>
              <Text>(icon)</Text>
              <Text>{`You've claimed your GD`}</Text>
              <Button onPress={this.handleClaim}>claim!</Button>
              <Button onPress={() => this.setState({ displayModal: false })}>YAY!</Button>
            </View>
          </Modal>
        </Portal>
      </Portal.Host>
    )
  }
}

const FRstyles = StyleSheet.create({
  description: {
    fontSize: normalize(20)
  }
})

export default createStackNavigator({
  Claim,
  FaceRecognition: {
    screen: FaceRecognition,
    navigationOptions: { title: 'Claim GD' }
  }
})
