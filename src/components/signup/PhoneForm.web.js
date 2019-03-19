// @flow
import React from 'react'
import { HelperText } from 'react-native-paper'
import PhoneInput from 'react-phone-number-input'
import 'react-phone-number-input/style.css'

import isMobilePhone from '../../lib/validators/isMobilePhone'
import { Description, Title, Wrapper } from './components'

type Props = {
  // callback to report to parent component
  doneCallback: ({ phone: string }) => null,
  screenProps: any,
  navigation: any
}

export type MobileRecord = {
  mobile: string,
  errorMessage: string
}

type State = MobileRecord & { valid?: boolean }

export default class PhoneForm extends React.Component<Props, State> {
  state = {
    mobile: this.props.screenProps.data.mobile || '',
    errorMessage: ''
  }

  handleChange = (mobile: string) => {
    if (this.state.errorMessage !== '') {
      this.setState({ errorMessage: '' })
    }

    this.setState({ mobile })
  }

  handleSubmit = () => {
    if (this.state.errorMessage === '') {
      this.props.screenProps.doneCallback({ mobile: this.state.mobile })
    }
  }

  checkErrors = () => {
    const errorMessage = isMobilePhone(this.state.mobile) ? '' : 'Please enter a valid phone format'

    this.setState({ errorMessage })
  }

  render() {
    const { errorMessage } = this.state

    return (
      <Wrapper valid={true} handleSubmit={this.handleSubmit}>
        <Title>{`${this.props.screenProps.data.fullName}, \n May we have your number please?`}</Title>

        <PhoneInput
          id="signup_phone"
          placeholder="Enter phone number"
          value={this.state.mobile}
          onChange={this.handleChange}
          onBlur={this.checkErrors}
          error={errorMessage}
          autoFocus
        />
        <Description>We will shortly send you a verification code to this number</Description>
      </Wrapper>
    )
  }
}
