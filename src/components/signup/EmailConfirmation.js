// @flow
import React from 'react'
import { Platform, View } from 'react-native'
import logger from '../../lib/logger/pino-logger'
import API from '../../lib/API/api'
import { withStyles } from '../../lib/styles'
import SpinnerCheckMark from '../common/animations/SpinnerCheckMark'
import LoadingIndicator from '../common/view/LoadingIndicator'
import Section from '../common/layout/Section'
import ErrorText from '../common/form/ErrorText'
import OtpInput from '../common/form/OtpInput'
import { getDesignRelativeHeight } from '../../lib/utils/sizes'
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

  componentDidUpdate() {
    if (!this.state.renderButton) {
      this.displayDelayedRenderButton()
    }
  }

  displayDelayedRenderButton = () => {
    setTimeout(() => {
      this.setState({ renderButton: true })
    }, 10000)
  }

  handleChange = async (code: array) => {
    const codeValue = code.filter(val => val).join('')
    if (codeValue.replace(/ /g, '').length === NumInputs) {
      this.setState({
        loading: true,
        code,
      })
      try {
        await this.verifyCode(codeValue)
        this.handleSubmit()
      } catch (e) {
        log.error({ e })

        this.setState({
          errorMessage: e.message || e,
          loading: false,
        })
      }
    } else {
      this.setState({
        errorMessage: '',
        code,
      })
    }
  }

  handleSubmit = async () => {
    await this.props.screenProps.doneCallback({ isEmailConfirmed: true })

    this.setState({ loading: false })
  }

  // eslint-disable-next-line class-methods-use-this
  verifyCode(code: string) {
    return API.verifyEmail({ code: code.toString() })
  }

  handleRetry = async () => {
    this.setState({ sendingCode: true, code: Array(NumInputs).fill(null), errorMessage: '' })
    let { retryFunctionName } = this.props.screenProps

    retryFunctionName = retryFunctionName || 'sendVerificationEmail'

    try {
      await API[retryFunctionName]({ ...this.props.screenProps.data })
      this.setState({ sendingCode: false, resentCode: true })

      //turn checkmark back into regular resend text
      setTimeout(() => this.setState({ ...this.state, resentCode: false }, this.displayDelayedRenderButton), 2000)
    } catch (e) {
      log.error('resend email code failed', e.message, e)
      this.setState({
        errorMessage: e.message || e,
        sendingCode: false,
        renderButton: true,
      })
    }
  }

  render() {
    const { errorMessage, loading, code, resentCode, renderButton, sendingCode } = this.state
    const { styles } = this.props

    return (
      <CustomWrapper handleSubmit={this.handleSubmit} footerComponent={() => <React.Fragment />}>
        <Section grow justifyContent="flex-start">
          <Section.Stack justifyContent="flex-start" style={styles.container}>
            <Section.Row justifyContent="center">
              <Section.Title color="darkGray" fontSize={22} fontWeight="500" textTransform="none">
                {'You’ve got mail!\nA second verification code\nwas emailed to you'}
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
              onFinish={() => this.setState({ renderButton: false })}
            />
          </Section.Row>
        </Section>
        <LoadingIndicator force={loading} />
      </CustomWrapper>
    )
  }
}

const CodeAction = ({ renderButton, handleRetry, resentCode, sendingCode, onFinish }) => {
  if (renderButton) {
    return (
      <SpinnerCheckMark loading={sendingCode} success={resentCode} onFinish={onFinish}>
        <Section.Text
          textDecorationLine="underline"
          fontWeight="medium"
          fontSize={14}
          color="primary"
          onPress={handleRetry}
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
  successIconStyle: {
    borderWidth: 1,
    borderRadius: Platform.select({
      // FIXME: RN
      default: 48 / 2,
      web: '50%',
    }),
    borderColor: theme.colors.primary,
    position: 'relative',
    height: 48,
    width: 48,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
})

export default withStyles(getStylesFromProps)(EmailConfirmation)
