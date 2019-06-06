// @flow
import React from 'react'
import { Text, View, StyleSheet } from 'react-native'
import OtpInput from 'react-otp-input'
import { ActionButton, Error, Title, Wrapper, Description } from './components'
import LoadingIndicator from '../common/LoadingIndicator'
import logger from '../../lib/logger/pino-logger'
import API from '../../lib/API/api'
import type { SignupState } from './SignupState'
import normalize from 'react-native-elements/src/helpers/normalizeText'
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
  sendingCode: boolean,
  renderButton: boolean,
  loading: boolean
}

export default class SmsForm extends React.Component<Props, State> {
  state = {
    smsValidated: false,
    sentSMS: false,
    valid: false,
    errorMessage: '',
    sendingCode: false,
    renderButton: false,
    loading: false
  }

  numInputs: number = 6

  componentDidMount() {}

  componentDidUpdate() {
    if (!this.state.renderButton) {
      this.handleRenderButtonVisibility()
    }
  }

  handleRenderButtonVisibility = () => {
    setTimeout(() => {
      this.setState({
        renderButton: true
      })
    }, 7000)
  }

  handleChange = async (otp: string) => {
    if (otp.length === this.numInputs) {
      this.setState({ loading: true })
      try {
        await this.verifyOTP(otp)
        this.setState({
          valid: true,
          loading: false
        })
        this.handleSubmit()
      } catch (e) {
        log.error({ e })
        this.setState({
          errorMessage: e.response.data.message,
          loading: false
        })
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
    this.setState({ sendingCode: false, renderButton: false }, this.handleRenderButtonVisibility)
  }

  render() {
    const { valid, errorMessage, sendingCode, renderButton, loading } = this.state

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
    margin: '1em'
  },
  buttonWrapper: {
    alignContent: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  button: {
    justifyContent: 'center',
    width: '100%',
    height: normalize(60)
  }
})

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
