// @flow
import React from 'react'
import { View, StyleSheet } from 'react-native'
import NameForm from './NameForm'
import EmailForm from './EmailForm'
import PhoneForm from './PhoneForm'
import SmsForm from './SmsForm'
import EmailConfirmation from './EmailConfirmation'
import FaceRecognition from './FaceRecognition'
import SignupCompleted from './SignupCompleted'

import NavBar from '../appNavigation/NavBar'

import { createSwitchNavigator } from '@react-navigation/core'
import logger from '../../lib/logger/pino-logger'

import API from '../../lib/API/api'
import goodWallet from '../../lib/wallet/GoodWallet'

import type { UserRecord } from '../../lib/API/api'
import userStorage from '../../lib/gundb/UserStorage'
import type { SMSRecord } from './SmsForm'

const log = logger.child({ from: 'SignupState' })

type SignupState = UserRecord & SMSRecord

const SignupWizardNavigator = createSwitchNavigator({
  Name: NameForm,
  Phone: PhoneForm,
  SMS: SmsForm,
  Email: EmailForm,
  EmailConfirmation,
  FaceRecognition,
  SignupCompleted
})

class Signup extends React.Component<{ navigation: any, screenProps: any }, SignupState> {
  static router = SignupWizardNavigator.router

  state = {
    pubkey: goodWallet.account,
    fullName: '',
    email: '',
    mobile: '',
    smsValidated: false,
    jwt: ''
  }

  saveProfile() {
    ;['fullName', 'email', 'mobile'].forEach(field => userStorage.setProfileField(field, this.state[field], 'masked'))
  }
  done = async (data: { [string]: string }) => {
    log.info('signup data:', { data })
    this.setState(data)
    let nextRoute = this.props.navigation.state.routes[this.props.navigation.state.index + 1]
    if (nextRoute) this.props.navigation.navigate(nextRoute.key)
    else {
      log.info('Sending new user data', this.state)
      this.saveProfile()
      await API.verifyUser({})
      await API.addUser(this.state)
      this.props.navigation.navigate('AppNavigation')
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
      <View style={styles.container}>
        <NavBar goBack={this.back} title={'Signu Up'} />
        <View style={styles.contentContainer}>
          <SignupWizardNavigator
            navigation={this.props.navigation}
            screenProps={{ ...this.props.screenProps, data: this.state, doneCallback: this.done, back: this.back }}
          />
        </View>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  contentContainer: { justifyContent: 'center', flexDirection: 'row', flex: 1 }
})

export default Signup
