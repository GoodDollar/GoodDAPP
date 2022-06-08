// @flow
import React from 'react'
import { KeyboardAvoidingView } from 'react-native'
import { isIOS } from '../../lib/utils/platform'
import logger from '../../lib/logger/js-logger'
import API from '../../lib/API'
import { withStyles } from '../../lib/styles'
import SpinnerCheckMark from '../common/animations/SpinnerCheckMark'
import LoadingIndicator from '../common/view/LoadingIndicator'
import Section from '../common/layout/Section'
import Text from '../common/view/Text'
import ErrorText from '../common/form/ErrorText'
import OtpInput from '../common/form/OtpInput'
import { getDesignRelativeHeight } from '../../lib/utils/sizes'
import useOnPress from '../../lib/hooks/useOnPress'
import { fireEvent, SIGNUP_RETRY_EMAIL } from '../../lib/analytics/analytics'
import CustomWrapper from './signUpWrapper'
import type { SignupState } from './SignupState'

const log = logger.child({ from: 'EmailConfirmation' })

type Props = {
  phone: string,
  data: SignupState,
  doneCallback: ({ isPhoneVerified: boolean }) => null,
  screenProps: any,
}

export type CodeRecord = {
  isEmailConfirmed: boolean,
  sentCode?: boolean,
}

type State = CodeRecord & {
  errorMessage: string,
  sendingCode: boolean,
  renderButton: boolean,
  loading: boolean,
  code: string | number,
}

const NumInputs: number = 6

class EmailConfirmation extends React.Component<Props, State> {
  state = {
    isEmailConfirmed: false,
    sentCode: false,
    errorMessage: '',
    sendingCode: false,
    renderButton: false,
    resentCode: false,
    loading: false,
    code: Array(NumInputs).fill(null),
  }

  componentDidMount() {
    this.displayDelayedRenderButton()
  }

  displayDelayedRenderButton = () => {
    setTimeout(() => {
      this.setState({ ...this.state, renderButton: true })
    }, 10000)
  }

  handleChange = async (code: array) => {
    const codeValue = code.filter(val => val).join('')
    if (codeValue.replace(/ /g, '').length === NumInputs) {
      this.setState({
        ...this.state,
        loading: true,
        code,
      })
      try {
        await this.verifyCode(codeValue)
        this.handleSubmit()
      } catch (e) {
        log.error('Submit email verification code failed', e.message, e)

        this.setState({
          ...this.state,
          errorMessage: e.error || e.message || e,
          loading: false,
        })
      }
    } else {
      this.setState({
        ...this.state,
        errorMessage: '',
        code,
      })
    }
  }

  handleSubmit = () => {
    this.setState({ ...this.state, loading: false }, () =>
      this.props.screenProps.doneCallback({ isEmailConfirmed: true }),
    )
  }

  // eslint-disable-next-line class-methods-use-this
  verifyCode(code: string) {
    return API.verifyEmail({ code: code.toString() })
  }

  handleRetry = async () => {
    this.setState({ ...this.state, sendingCode: true, code: Array(NumInputs).fill(null), errorMessage: '' })
    let { retryFunctionName } = this.props.screenProps

    retryFunctionName = retryFunctionName || 'sendVerificationEmail'

    try {
      fireEvent(SIGNUP_RETRY_EMAIL)
      await API[retryFunctionName]({ ...this.props.screenProps.data })
      this.setState({ ...this.state, sendingCode: false, resentCode: true })
      this.displayDelayedRenderButton()
    } catch (e) {
      log.error('resend email code failed', e.message, e)
      this.setState({
        ...this.state,
        errorMessage: e.message || e,
        sendingCode: false,
        resentCode: false,
        renderButton: true,
      })
    }
  }

  render() {
    const { errorMessage, loading, code, resentCode, renderButton, sendingCode } = this.state
    const { styles, theme } = this.props

    return (
      <KeyboardAvoidingView behavior={isIOS ? 'padding' : 'height'} style={styles.keyboardAvoidWrapper}>
        <CustomWrapper handleSubmit={this.handleSubmit} footerComponent={() => <React.Fragment />}>
          <Section grow justifyContent="flex-start">
            <Section.Stack justifyContent="flex-start" style={styles.container}>
              <Text
                color={'primary'}
                fontSize={getDesignRelativeHeight(12)}
                lineHeight={getDesignRelativeHeight(21)}
                letterSpacing={0.26}
                fontFamily="Roboto"
                fontWeight="bold"
                textTransform="uppercase"
                style={{ marginBottom: getDesignRelativeHeight(14) }}
              >
                Email Verification
              </Text>
              <Section.Stack justifyContent="center">
                <Section.Title
                  color="darkIndigo"
                  fontSize={18}
                  fontWeight="400"
                  textTransform="none"
                  style={{ marginVertical: 0 }}
                >
                  Got it, thanks.
                </Section.Title>
                <Section.Title
                  color="darkIndigo"
                  fontSize={getDesignRelativeHeight(18)}
                  fontWeight="500"
                  textTransform="none"
                  style={{ marginVertical: 0 }}
                >
                  {`Please enter the verification code sent\n to your e-mail.`}
                </Section.Title>
              </Section.Stack>
              <Section.Stack justifyContent="center" style={styles.bottomContent}>
                <OtpInput
                  shouldAutoFocus
                  numInputs={NumInputs}
                  onChange={this.handleChange}
                  hasErrored={errorMessage !== ''}
                  errorStyle={styles.errorStyle}
                  value={code}
                  placeholder="*"
                  placeholderTextColor={theme.colors.darkIndigo}
                  isInputNum={true}
                  aside={[3]}
                  inputStyle={styles.otpInput}
                />
                {errorMessage ? (
                  <ErrorText error={errorMessage} />
                ) : (
                  <Section.Text fontSize={14} color="darkIndigo" style={{ marginTop: 12 }}>
                    Please wait a few seconds until the email arrives
                  </Section.Text>
                )}
              </Section.Stack>
            </Section.Stack>
            <Section.Row alignItems="center" justifyContent="center" style={styles.row}>
              <CodeAction
                sendingCode={sendingCode}
                resentCode={resentCode}
                renderButton={renderButton}
                handleRetry={this.handleRetry}
                onFinish={() => this.setState({ ...this.state, renderButton: false, resentCode: false })}
              />
            </Section.Row>
          </Section>
          <LoadingIndicator force={loading} />
        </CustomWrapper>
      </KeyboardAvoidingView>
    )
  }
}

const CodeAction = ({ renderButton, handleRetry, resentCode, sendingCode, onFinish }) => {
  const _handleRetry = useOnPress(handleRetry)

  const renderRetryButton = () => {
    return (
      <SpinnerCheckMark loading={sendingCode} success={resentCode} onFinish={onFinish} height={150} width={150}>
        <Section.Text
          textDecorationLine="underline"
          fontWeight="medium"
          fontSize={14}
          lineHeight={30}
          color="primary"
          onPress={_handleRetry}
        >
          Send me the code again
        </Section.Text>
      </SpinnerCheckMark>
    )
  }

  return (
    <Section.Stack>
      <Section.Text fontSize={14} lineHeight={30} color="extraLighterGray">
        (0:00)
      </Section.Text>
      {renderRetryButton()}
    </Section.Stack>
  )
}

const getStylesFromProps = ({ theme }) => ({
  keyboardAvoidWrapper: {
    width: '100%',
  },
  row: {
    marginTop: theme.sizes.defaultQuadruple,
    marginBottom: theme.sizes.defaultQuadruple,
  },
  errorStyle: {
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.googleRed,
    color: theme.colors.googleRed,
  },
  container: {},
  bottomContent: {
    marginTop: getDesignRelativeHeight(35),
    marginBottom: theme.sizes.defaultDouble,
  },
  otpInput: {
    color: theme.colors.lightBlue,
    borderBottomColor: theme.colors.lightBlue,
  },
})

export default withStyles(getStylesFromProps)(EmailConfirmation)
