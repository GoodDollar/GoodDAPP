// @flow
import React from 'react'
import { Text } from 'react-native'
import OtpInput from 'react-otp-input'
import { Title, Wrapper } from './components'
import logger from '../../lib/logger/pino-logger'

const log = logger.child({ from: 'SmsForm.web' })

type Props = {
  // callback to report to parent component
  phone: string,
  doneCallback: ({ isPhoneVerified: boolean }) => null,
  screenProps: any
}

export type SMSRecord = {
  smsValidated: boolean,
  sentSMS?: boolean
}

type State = SMSRecord & { valid?: boolean }

export default class SmsForm extends React.Component<Props, State> {
  state = {
    smsValidated: false,
    sentSMS: false,
    valid: false
  }

  numInputs: number = 5

  componentDidMount() {
    this.focusInput()
    this.listenSMS()
    this.sendSMS()
  }

  handleChange = (otp: string) => {
    if (otp.length === this.numInputs) {
      this.verifyOTP(otp)
    }
  }

  handleSubmit = () => {
    this.props.screenProps.doneCallback({ smsValidated: true })
  }

  // eslint-disable-next-line class-methods-use-this
  listenSMS() {
    const options = {
      length: this.numInputs
    }

    const success = otp => {
      let inputs = document.getElementsByClassName('signup_otp')[0].getElementsByTagName('input')
      log.info('GOT OTP', otp)
      otp.split('').forEach((num, i) => {
        log.info(num, i)
        inputs[i].value = num
      })
      this.verifyOTP(otp)
    }

    const failure = () => {
      log.info('Problem in listening OTP')
    }
    log.info('Starting OTP listener:', window.device)

    if (window.OTPAutoVerification) window.OTPAutoVerification.startOTPListener(options, success, failure)
  }

  focusInput() {
    if (window.Keyboard && window.Keyboard.show) {
      window.Keyboard.show()
    }
  }

  // eslint-disable-next-line class-methods-use-this
  verifyOTP(otp: string) {
    if (otp.length === this.numInputs) {
      this.setState({ valid: true })
      this.handleSubmit()
      return true
    }
    return false
  }

  sendSMS() {
    log.info('sms to:', this.props.phone)
    setTimeout(() => this.setState({ sentSMS: true }), 2000)
  }

  render() {
    return (
      <Wrapper valid={this.state.valid} handleSubmit={this.handleSubmit}>
        <Title>{"Your verification code\nYou've just received"}</Title>
        <OtpInput
          containerStyle={{
            justifyContent: 'space-evenly'
          }}
          inputStyle={{
            width: '100%',
            height: '3rem',
            margin: '0 0.5rem',
            fontSize: '1.5rem',
            borderTop: 'none',
            borderRight: 'none',
            borderLeft: 'none',
            borderBottom: '1px solid #555'
          }}
          shouldAutoFocus
          numInputs={this.numInputs}
          onChange={this.handleChange}
          isInputNum={true}
        />
        <Text>{this.state.sentSMS ? 'SMS in 15 secs' : 'Sending SMS...'}</Text>
      </Wrapper>
    )
  }
}
