// @flow
import React from 'react'
import NameForm from './NameForm'
import EmailForm from './EmailForm'
import PhoneForm from './PhoneForm'
import SmsForm from './SmsForm'
import { createSwitchNavigator } from '@react-navigation/core'
import logger from '../../lib/logger/pino-logger'

import type { UserRecord } from '../../lib/API/api'
import API from '../../lib/API/api'
import goodWallet from '../../lib/wallet/GoodWallet'
import type { SMSRecord } from './SmsForm'

const log = logger.child({ from: 'SignupState' })

type SignupState = UserRecord & SMSRecord

const SignupWizardNavigator = createSwitchNavigator({
  Name: NameForm,
  Email: EmailForm,
  Phone: PhoneForm,
  SMS: SmsForm
})

class Signup extends React.Component<{ navigation: any }, SignupState> {
  static router = SignupWizardNavigator.router

  state = {
    pubkey: goodWallet.account,
    fullName: '',
    email: '',
    mobile: '',
    smsValidated: false,
    jwt: ''
  }

  done = (data: { [string]: string }) => {
    log.info('signup data:', data, this.state)
    this.setState(data)
    let nextRoute = this.props.navigation.state.routes[this.props.navigation.state.index + 1]

    if (nextRoute) {
      this.props.navigation.navigate(nextRoute.key)
    } else {
      log.info('Sending new user data', this.state)
      API.addUser(this.state).then(() => {
        this.props.navigation.navigate('AppNavigation')
      })
    }
  }

  back = () => {
    const nextRoute = this.props.navigation.state.routes[this.props.navigation.state.index - 1]

    if (nextRoute) {
      this.props.navigation.navigate(nextRoute.key)
    } else {
      this.props.navigation.navigate('Auth')
    }
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
