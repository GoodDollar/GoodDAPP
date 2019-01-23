// @flow
import { extend } from 'lodash'
import React, { Component } from 'react'
import { View, Text } from 'react-native'
import NameForm from './NameForm'
import EmailForm from './EmailForm'
import PhoneForm from './PhoneForm'
import SmsForm from './SmsForm'
import { createSwitchNavigator } from '@react-navigation/core'

import API from '../../lib/API/api'
import GoodWallet from '../../lib/wallet/GoodWallet'

type SignupState = {
  pubkey:string,
  email?:string,
  phone?:string,
  name?:string,
  smsValidated?:boolean
};


const SignupWizardNavigator = createSwitchNavigator({
  Name: NameForm,
  Email: EmailForm,
  Phone: PhoneForm,
  SMS: SmsForm
});


class Signup extends React.Component<{navigation:any},SignupState> {
  static router = SignupWizardNavigator.router;
  state = {
    pubkey: GoodWallet.account
  }
  constructor(props) {
    super(props)
    console.log()
  }

  done = (data:{[string]:string}) => {
    console.log("signup data:",{data})
    this.setState(data)
    let nextRoute = this.props.navigation.state.routes[this.props.navigation.state.index + 1]
    if(nextRoute)
      this.props.navigation.navigate(nextRoute.key)
    else
    {
      console.log("Sending new user data",this.state)
      API.addUser(this.state).then(response => {
        this.props.navigation.navigate('AppNavigation');
      })
    }
  }

  back = () => {
    let nextRoute = this.props.navigation.state.routes[this.props.navigation.state.index - 1]
    if(nextRoute)
      this.props.navigation.navigate(nextRoute.key)
  }
  render() {
    console.log("this.props SignupState",this.props)
    return ( 
        <SignupWizardNavigator navigation={this.props.navigation} screenProps={{data:this.state,doneCallback:this.done,back:this.back}} />
    );
  }
}
export default Signup
