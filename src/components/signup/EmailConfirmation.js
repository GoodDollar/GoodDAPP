// @flow
import React from 'react'
import { KeyboardAvoidingView } from 'react-native'
import { isIOS } from '../../lib/utils/platform'
import logger from '../../lib/logger/js-logger'
import API from '../../lib/API/api'
import { withStyles } from '../../lib/styles'
import SpinnerCheckMark from '../common/animations/SpinnerCheckMark'
import LoadingIndicator from '../common/view/LoadingIndicator'
import Section from '../common/layout/Section'
import ErrorText from '../common/form/ErrorText'
import OtpInput from '../common/form/OtpInput'
import { getDesignRelativeHeight } from '../../lib/utils/sizes'
import useOnPress from '../../lib/hooks/useOnPress'
import { fireEvent, SIGNUP_RETRY_EMAIL } from '../../lib/analytics/analytics'
import CustomWrapper from './signUpWrapper'
import type { SignupState } from './SignupState'

const log = logger.get('EmailConfirmation')

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
    const { styles } = this.props

    return (
      <KeyboardAvoidingView behavior={isIOS ? 'padding' : 'height'} style={styles.keyboardAvoidWrapper}>
        <CustomWrapper handleSubmit={this.handleSubmit} footerComponent={() => <React.Fragment />}>
          <Section grow justifyContent="flex-start">
            <Section.Stack justifyContent="flex-start" style={styles.container}>
              <Section.Row justifyContent="center">
                <Section.Title color="darkGray" fontSize={22} fontWeight="medium" textTransform="none">
                  {'You’ve got mail!\nA verification code\nwas emailed to you'}
                </Section.Title>
              </Section.Row>
              <Section.Stack justifyContent="center" style={styles.bottomContent}>
                <OtpInput
                  shouldAutoFocus
                  numInputs={NumInputs}
                  onChange={this.handleChange}
                  hasErrored={errorMessage !== ''}
                  errorStyle={styles.errorStyle}
                  value={code}
                  placeholder="*"
                  isInputNum={true}
                  aside={[3]}
                />
                <ErrorText error={errorMessage} />
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
  if (renderButton) {
    return (
      <SpinnerCheckMark loading={sendingCode} success={resentCode} onFinish={onFinish} height={150} width={150}>
        <Section.Text
          textDecorationLine="underline"
          fontWeight="medium"
          fontSize={14}
          color="primary"
          onPress={_handleRetry}
        >
          email me the code again
        </Section.Text>
      </SpinnerCheckMark>
    )
  }
  return (
    <Section.Text fontSize={14} color="gray80Percent">
      Please wait a few seconds until the email arrives
    </Section.Text>
  )
}

const getStylesFromProps = ({ theme }) => ({
  keyboardAvoidWrapper: {
    width: '100%',
  },
  row: {
    marginTop: theme.sizes.defaultDouble,
    marginBottom: theme.sizes.defaultDouble,
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
})

export default withStyles(getStylesFromProps)(EmailConfirmation)
