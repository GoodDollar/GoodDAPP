// @flow
import React from 'react'
import { Text, View } from 'react-native'
import OtpInput from 'react-otp-input'
import normalize from 'react-native-elements/src/helpers/normalizeText'
import logger from '../../lib/logger/pino-logger'
import API from '../../lib/API/api'
import { ActionButton, Error, Title, Wrapper } from './components'
import type { SignupState } from './SignupState'
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

  componentDidMount() {}

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
  verifyOTP(otp: string) {
    return API.verifyMobile({ otp })
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
        <Title>{'Enter the verification code \n sent to your phone'}</Title>
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
