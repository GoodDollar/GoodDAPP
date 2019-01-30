// @flow
import React from 'react'
import Mnemonics from './Mnemonics'
import { createSwitchNavigator } from '@react-navigation/core'

type SignInState = {
  phoneNumber: string,
  smsValidated?: boolean,
  mnemonics: string
}

const SignInWizardNavigator = createSwitchNavigator({
  Mnemonics: Mnemonics
})

class SignIn extends React.Component<{ navigation: any }, SignInState> {
  static router = SignInWizardNavigator.router

  state: SignInState = {
    phoneNumber: '',
    smsValidated: false,
    mnemonics: ''
  }

  done = (data: { [string]: string }) => {
    this.setState(data)
    const nextRoute = this.props.navigation.state.routes[this.props.navigation.state.index + 1]

    if (nextRoute) {
      this.props.navigation.navigate(nextRoute.key)
    } else {
      this.props.navigation.navigate('AppNavigation')
    }
  }

  back = () => {
    const prevRoute = this.props.navigation.state.routes[this.props.navigation.state.index - 1]
    if (prevRoute) this.props.navigation.navigate(prevRoute.key)
  }
  render() {
    return (
      <SignInWizardNavigator
        navigation={this.props.navigation}
        screenProps={{ data: this.state, doneCallback: this.done, back: this.back }}
      />
    )
  }
}
export default SignIn
