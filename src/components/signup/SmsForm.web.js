// @flow
import React from 'react'
import { StyleSheet, View } from 'react-native'
import OtpInput from 'react-otp-input'
import normalize from 'react-native-elements/src/helpers/normalizeText'
import logger from '../../lib/logger/pino-logger'
import API from '../../lib/API/api'
import { LoadingIndicator, Text } from '../common'
import { ActionButton, Description, Error, Title, Wrapper } from './components'
import type { SignupState } from './SignupState'

const log = logger.child({ from: 'SmsForm.web' })

type Props = {
  phone: string,
  data: SignupState,
  doneCallback: ({ isPhoneVerified: boolean }) => null,
  screenProps: any,
}

export type SMSRecord = {
  smsValidated: boolean,
  sentSMS?: boolean,
}

type State = SMSRecord & {
  valid?: boolean,
  errorMessage: string,
  sendingCode: boolean,
  renderButton: boolean,
  loading: boolean,
  otp: string | number,
}

export default class SmsForm extends React.Component<Props, State> {
  state = {
    smsValidated: false,
    sentSMS: false,
    valid: false,
    errorMessage: '',
    sendingCode: false,
    renderButton: false,
    loading: false,
    otp: '',
  }

  numInputs: number = 6

  componentDidMount() {}

  componentDidUpdate() {
    if (!this.state.renderButton) {
      this.displayDelayedRenderButton()
    }
  }

  displayDelayedRenderButton = () => {
    setTimeout(() => {
      this.setState({ renderButton: true })
    }, 7000)
  }

  handleChange = async (otp: string | number) => {
    const otpValue = otp.toString()
    if (otpValue.length === this.numInputs) {
      this.setState({
        loading: true,
        otp,
      })
      try {
        await this.verifyOTP(otpValue)
        this.setState({
          valid: true,
          loading: false,
        })
        this.handleSubmit()
      } catch (e) {
        log.error({ e })
        this.setState({
          errorMessage: e.response.data.message,
          loading: false,
        })
      }
    } else {
      this.setState({
        errorMessage: '',
        otp,
      })
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
    this.setState({ sendingCode: true, otp: '', errorMessage: '' })

    try {
      await API.sendOTP({ ...this.props.screenProps.data })
    } catch (e) {
      log.error(e)
    }
    this.setState({ sendingCode: false, renderButton: false }, this.displayDelayedRenderButton)
  }

  render() {
    const { valid, errorMessage, sendingCode, renderButton, loading, otp } = this.state

    return (
      <Wrapper valid={valid} handleSubmit={this.handleSubmit} footerComponent={() => <React.Fragment />}>
        <Title>{'Enter the verification code \n sent to your phone'}</Title>
        <OtpInput
          containerStyle={{
            justifyContent: 'space-evenly',
          }}
          inputStyle={inputStyle}
          shouldAutoFocus
          numInputs={this.numInputs}
          onChange={this.handleChange}
          isInputNum={true}
          hasErrored={errorMessage !== ''}
          errorStyle={errorStyle}
          value={otp}
        />
        <Error>{errorMessage !== '' && errorMessage}</Error>
        <View style={styles.buttonWrapper}>
          {renderButton ? (
            <ActionButton
              styles={styles.button}
              loading={sendingCode}
              handleSubmit={this.handleRetry}
              disabled={sendingCode}
            >
              <Text>Send me the code again</Text>
            </ActionButton>
          ) : (
            <Description>Please wait a few seconds until the SMS arrives</Description>
          )}
        </View>
        <LoadingIndicator force={loading} />
      </Wrapper>
    )
  }
}

const styles = StyleSheet.create({
  informativeParagraph: {
    margin: '1em',
  },
  buttonWrapper: {
    alignContent: 'stretch',
    flexDirection: 'column',
    display: 'flex',
    justifyContent: 'space-between',
  },
  button: {
    justifyContent: 'center',
    width: '100%',
    height: normalize(60),
  },
})

const inputStyle = {
  width: '100%',
  height: '3rem',
  margin: '0 0.5rem',
  fontSize: '1.5rem',
  borderTop: 'none',
  borderRight: 'none',
  borderLeft: 'none',
  borderBottom: '1px solid #555',
}

const errorStyle = {
  ...inputStyle,
  borderBottom: '1px solid red',
  color: 'red',
}
