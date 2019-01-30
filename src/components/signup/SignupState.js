// @flow
import { extend } from 'lodash'
import React, { Component } from 'react'
import { View, Text } from 'react-native'
import NameForm from './NameForm'
import EmailForm from './EmailForm'
import PhoneForm from './PhoneForm'
import SmsForm from './SmsForm'
import { createSwitchNavigator } from '@react-navigation/core'
import logger from '../../lib/logger/pino-logger'

import API from '../../lib/API/api'
import GoodWallet from '../../lib/wallet/GoodWallet'

const log = logger.child({ from: 'SignupState' })

type SignupState = {
  pubkey: string,
  email?: string,
  phone?: string,
  name?: string,
  smsValidated?: boolean
}

const SignupWizardNavigator = createSwitchNavigator({
  Name: NameForm,
  Email: EmailForm,
  Phone: PhoneForm,
  SMS: SmsForm
})

class Signup extends React.Component<{ navigation: any }, SignupState> {
  static router = SignupWizardNavigator.router
  state = {
    pubkey: GoodWallet.account
  }
  constructor(props) {
    super(props)
    log.info()
  }

  done = async (data: { [string]: string }) => {
    log.info('signup data:', { data })
    this.setState(data)
    let nextRoute = this.props.navigation.state.routes[this.props.navigation.state.index + 1]
    if (nextRoute) this.props.navigation.navigate(nextRoute.key)
    else {
      log.info('Sending new user data', this.state)
      await API.verifyUser({})
      await API.addUser(this.state)
      this.props.navigation.navigate('AppNavigation')
    }
  }

  back = () => {
    let nextRoute = this.props.navigation.state.routes[this.props.navigation.state.index - 1]
    if (nextRoute) this.props.navigation.navigate(nextRoute.key)
  }
  render() {
    log.info('this.props SignupState', this.props)
    return (
      <SignupWizardNavigator
        navigation={this.props.navigation}
        screenProps={{ data: this.state, doneCallback: this.done, back: this.back }}
      />
    )
  }
}
export default Signup
