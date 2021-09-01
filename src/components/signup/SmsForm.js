// @flow
import React, { useEffect, useRef, useState } from 'react'
import { KeyboardAvoidingView } from 'react-native'
import { isIOS } from '../../lib/utils/platform'
import logger from '../../lib/logger/js-logger'
import API, { getErrorMessage } from '../../lib/API/api'
import { getDesignRelativeHeight } from '../../lib/utils/sizes'
import { withStyles } from '../../lib/styles'
import SpinnerCheckMark from '../common/animations/SpinnerCheckMark'
import Section from '../common/layout/Section'
import ErrorText from '../common/form/ErrorText'
import OtpInput from '../common/form/OtpInput'
import useOnPress from '../../lib/hooks/useOnPress'
import LoadingIndicator from '../common/view/LoadingIndicator'
import { fireEvent, SIGNUP_RETRY_SMS } from '../../lib/analytics/analytics'
import Config from '../../config/config'
import CustomWrapper from './signUpWrapper'
import type { SignupState } from './SignupState'

const log = logger.get('SmsForm')
const { smsRateLimit } = Config

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
  errorMessage: string,
  sendingCode: boolean,
  renderButton: boolean,
  resentCode: boolean,
  loading: boolean,
  otp: Array<string>,
}

const NumInputs: number = 6

class SmsForm extends React.Component<Props, State> {
  state = {
    smsValidated: false,
    sentSMS: false,
    errorMessage: '',
    sendingCode: false,
    showWait: true,
    resentCode: false,
    loading: false,
    otp: Array(NumInputs).fill(null),
    tries: 1,
  }

  handleChange = async (otp: array) => {
    const otpValue = otp.filter(val => val).join('')
    if (otpValue.replace(/ /g, '').length === NumInputs) {
      this.setState({ ...this.state, loading: true, otp })
      try {
        await this.verifyOTP(otpValue)
        this.handleSubmit()
      } catch (e) {
        if (e.ok === 0) {
          log.warn('Verify otp failed', e.message, e)
        } else {
          log.error('Verify otp failed', e.message, e)
        }

        this.setState({ ...this.state, errorMessage: e.message || e.error || e, loading: false })
      }
    } else {
      this.setState({ ...this.state, errorMessage: '', otp })
    }
  }

  handleSubmit = async () => {
    this.setState({ ...this.state, loading: false })
    await this.props.screenProps.doneCallback({ smsValidated: true })
  }

  handleSkip = async () => {
    this.setState({ ...this.state, loading: false })
    await this.props.screenProps.doneCallback({ smsValidated: false })
  }

  // eslint-disable-next-line class-methods-use-this
  verifyOTP(otp: string) {
    return API.verifyMobile({ otp })
  }

  handleRetryWithCall = async () => {
    await this.handleRetry({ otpChannel: 'call' })
  }

  handleRetry = async (options: any) => {
    const { otpChannel } = options
    this.setState({ ...this.state, sendingCode: true, otp: Array(NumInputs).fill(null), errorMessage: '' })
    let { retryFunctionName } = this.props.screenProps

    retryFunctionName = retryFunctionName || 'sendOTP'

    try {
      fireEvent(SIGNUP_RETRY_SMS, { type: otpChannel })
      await API[retryFunctionName]({ ...this.props.screenProps.data, otpChannel })
      this.setState(prev => ({ ...prev, tries: prev.tries + 1, sendingCode: false, resentCode: true }))
    } catch (e) {
      const errorMessage = getErrorMessage(e)
      const exception = new Error(errorMessage)

      log.error('Resend sms code failed', errorMessage, exception)

      this.setState(prev => ({ ...prev, tries: prev.tries + 1, errorMessage, sendingCode: false, resentCode: false }))
    }
  }

  render() {
    const { errorMessage, otp, renderButton, sendingCode, resentCode } = this.state
    const { styles } = this.props

    return (
      <KeyboardAvoidingView behavior={isIOS ? 'padding' : 'height'} style={styles.keyboardAvoidWrapper}>
        <CustomWrapper handleSubmit={this.handleSubmit} footerComponent={() => <React.Fragment />}>
          <Section grow justifyContent="flex-start">
            <Section.Stack justifyContent="flex-start" style={styles.container}>
              <Section.Row justifyContent="center">
                <Section.Title color="darkGray" fontSize={22} fontWeight="medium" textTransform="none">
                  {'Enter the verification code\nsent to your phone'}
                </Section.Title>
              </Section.Row>
              <Section.Stack justifyContent="center" style={styles.bottomContent}>
                <OtpInput
                  shouldAutoFocus
                  numInputs={NumInputs}
                  onChange={this.handleChange}
                  hasErrored={errorMessage !== ''}
                  errorStyle={styles.errorStyle}
                  value={otp}
                  placeholder="*"
                  isInputNum={true}
                  aside={[3]}
                />
                <ErrorText error={errorMessage} />
              </Section.Stack>
            </Section.Stack>
            <Section.Row alignItems="center" justifyContent="center" style={styles.row}>
              <SMSAction
                styles={styles}
                sendingCode={sendingCode}
                resentCode={resentCode}
                renderButton={renderButton}
                handleRetry={this.handleRetry}
                handleRetryWithCall={this.handleRetryWithCall}
                handleSkip={this.handleSkip}
                tries={this.state.tries}
                onFinish={() => {
                  //reset smsaction state
                  this.setState({ ...this.state, resentCode: false })
                }}
              />
            </Section.Row>
          </Section>
        </CustomWrapper>
        <LoadingIndicator force={this.state.loading} />
      </KeyboardAvoidingView>
    )
  }
}

//tries decides which options we show
//first  two tries "send sms"
//third try "send via call" or "skip"
//fourth "skip"
const SMSAction = ({
  handleRetry,
  handleRetryWithCall,
  handleSkip,
  resentCode,
  sendingCode,
  onFinish,
  tries,
  styles,
}) => {
  const smsRateLimitNormalized = smsRateLimit / 1000
  const [showWait, setWait] = useState(true)
  const [waitTime, setWaitTime] = useState(smsRateLimitNormalized)
  const [isCall, setIsCall] = useState(false)
  const _handleRetry = useOnPress(handleRetry)
  const _handleRetryWithCall = useOnPress(handleRetryWithCall)
  const _handleSkip = useOnPress(handleSkip)

  const countdownIntervalRef = useRef()
  useEffect(() => {
    // if sent call (after several sms retries) don't wait until countdown completes to show "skip" message
    if (showWait && !isCall) {
      let value = smsRateLimitNormalized
      countdownIntervalRef.current = setInterval(() => {
        value--
        if (!value) {
          value = smsRateLimitNormalized
        }
        setWaitTime(value)
      }, 1000)
      setTimeout(() => {
        if (countdownIntervalRef.current) {
          clearInterval(countdownIntervalRef.current)
          countdownIntervalRef.current = null
        }
        setWait(false)
      }, parseInt(smsRateLimit))
    } else {
      setWait(false)
    }
  }, [showWait])

  if (showWait === false) {
    return (
      <SpinnerCheckMark
        height={100}
        loading={sendingCode}
        success={resentCode}
        onFinish={() => {
          setWait(true)
          onFinish()
        }}
      >
        {tries < 3 && (
          <Section.Text
            textDecorationLine="underline"
            fontWeight="medium"
            fontSize={14}
            color="primary"
            onPress={_handleRetry}
            style={styles.sendCodeAgainButton}
          >
            Send the code again
          </Section.Text>
        )}
        {tries === 3 && (
          <Section.Text
            textDecorationLine="underline"
            fontWeight="medium"
            fontSize={14}
            color="primary"
            onPress={() => {
              setIsCall(true)
              _handleRetryWithCall()
            }}
            style={styles.sendCodeAgainButton}
          >
            Send via voice call
          </Section.Text>
        )}
        {tries >= 3 && (
          <Section.Text
            textDecorationLine="underline"
            fontWeight="medium"
            fontSize={14}
            color="primary"
            onPress={_handleSkip}
            style={styles.sendCodeAgainButton}
          >
            Skip mobile verification
          </Section.Text>
        )}
      </SpinnerCheckMark>
    )
  }

  return (
    <Section.Text fontSize={14} color="gray80Percent">
      Please wait {waitTime} seconds until the {isCall ? 'call' : 'SMS'} arrives
    </Section.Text>
  )
}

const getStylesFromProps = ({ theme }) => ({
  keyboardAvoidWrapper: {
    width: '100%',
  },
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
    height: 60,
  },
  row: {
    marginVertical: theme.sizes.defaultDouble,
  },
  errorStyle: {
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.red,
    color: theme.colors.red,
  },
  container: {
    minHeight: getDesignRelativeHeight(200),
    height: getDesignRelativeHeight(200),
  },
  bottomContent: {
    marginTop: 'auto',
    marginBottom: theme.sizes.defaultDouble,
  },
  sendCodeAgainButton: {
    flex: 1,
  },
})

export default withStyles(getStylesFromProps)(SmsForm)
