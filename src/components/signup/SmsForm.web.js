// @flow
import React from 'react'
import { Text, View } from 'react-native'
import OtpInput from 'react-otp-input'
import { ActionButton, Error, Title, Wrapper } from './components'
import logger from '../../lib/logger/pino-logger'
import API from '../../lib/API/api'
import type { SignupState } from './SignupState'
import { normalize } from 'react-native-elements'

const log = logger.child({ from: 'SmsForm.web' })

type Props = {
  // callback to report to parent component
  phone: string,
  data: SignupState,
  doneCallback: ({ isPhoneVerified: boolean }) => null,
  screenProps: any
}

export type SMSRecord = {
  smsValidated: boolean,
  sentSMS?: boolean
}

type State = SMSRecord & {
  valid?: boolean,
  errorMessage: string,
  sendingCode: boolean
}

export default class SmsForm extends React.Component<Props, State> {
  state = {
    smsValidated: false,
    sentSMS: false,
    valid: false,
    errorMessage: '',
    sendingCode: false
  }

  numInputs: number = 6

  componentDidMount() {
    this.focusInput()
    this.listenSMS()
    this.sendSMS()
  }

  handleChange = async (otp: string) => {
    if (otp.length === this.numInputs) {
      try {
        await this.verifyOTP(otp)
        this.setState({ valid: true })
        this.handleSubmit()
      } catch (e) {
        log.error({ e })
        this.setState({ errorMessage: e.response.data.message })
      }
    } else {
      this.setState({ errorMessage: '' })
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
    return API.verifyMobile({ otp })
  }

  sendSMS() {
    log.info('sms to:', this.props.phone)
    setTimeout(() => this.setState({ sentSMS: true }), 2000)
  }

  handleRetry = async () => {
    this.setState({ sendingCode: true })

    try {
      await API.sendOTP({ ...this.props.screenProps.data })
    } catch (e) {
      log.error(e)
    }

    this.setState({ sendingCode: false })
  }

  render() {
    const { valid, errorMessage, sendingCode } = this.state

    return (
      <Wrapper valid={valid} handleSubmit={this.handleSubmit} footerComponent={() => <React.Fragment />}>
        <Title>{"Your verification code\nYou've just received"}</Title>
        <OtpInput
          containerStyle={{
            justifyContent: 'space-evenly'
          }}
          inputStyle={inputStyle}
          shouldAutoFocus
          numInputs={this.numInputs}
          onChange={this.handleChange}
          isInputNum={true}
          hasErrored={errorMessage !== ''}
          errorStyle={errorStyle}
        />
        <Error>{errorMessage !== '' && errorMessage}</Error>
        <View style={buttonRow.wrapper}>
          <ActionButton styles={buttonRow.button} loading={sendingCode} handleSubmit={this.handleRetry}>
            <Text>Send me the code again</Text>
          </ActionButton>
        </View>
      </Wrapper>
    )
  }
}

const inputStyle = {
  width: '100%',
  height: '3rem',
  margin: '0 0.5rem',
  fontSize: '1.5rem',
  borderTop: 'none',
  borderRight: 'none',
  borderLeft: 'none',
  borderBottom: '1px solid #555'
}

const errorStyle = {
  ...inputStyle,
  borderBottom: '1px solid red',
  color: 'red'
}

const buttonRow = {
  wrapper: {
    alignContent: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  button: {
    justifyContent: 'center',
    width: '100%',
    height: normalize(60)
  }
}
