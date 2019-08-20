// @flow
import React from 'react'
import normalize from '../../lib/utils/normalizeText'
import logger from '../../lib/logger/pino-logger'
import API from '../../lib/API/api'
import { withStyles } from '../../lib/styles'
import Icon from '../common/view/Icon'
import LoadingIndicator from '../common/view/LoadingIndicator'
import Section from '../common/layout/Section'
import { ErrorText } from '../common/form/InputText'
import OtpInput from '../common/form/OtpInput'
import CustomWrapper from './signUpWrapper'
import type { SignupState } from './SignupState'

const log = logger.child({ from: 'EmailConfirmation' })

const DONE = 'DONE'
const WAIT = 'WAIT'
const PENDING = 'PENDING'

type Props = {
  phone: string,
  data: SignupState,
  doneCallback: ({ isPhoneVerified: boolean }) => null,
  screenProps: any,
}

export type CodeRecord = {
  codeValidated: boolean,
  sentCode?: boolean,
}

type State = CodeRecord & {
  errorMessage: string,
  sendingCode: boolean,
  renderButton: boolean,
  loading: boolean,
  code: string | number,
}

class EmailConfirmation extends React.Component<Props, State> {
  state = {
    codeValidated: false,
    sentCode: false,
    errorMessage: '',
    sendingCode: false,
    renderButton: false,
    resentCode: false,
    loading: false,
    code: undefined,
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
    }, 10000)
  }
  
  handleChange = async (code: string | number) => {
    const codeValue = code.toString()
  
    if (codeValue.length === this.numInputs) {
      this.setState({
        loading: true,
        code: code,
      })
      try {
        await this.verifyCode(code)
        this.handleSubmit()
      } catch (e) {
        log.error({ e })
        this.setState({
          errorMessage: e.response.data.message || e.message
        })
      } finally {
        this.setState({ loading: false })
      }
    } else {
      this.setState({
        errorMessage: '',
        code: code,
      })
    }
  }
  
  handleSubmit = () => {
    this.props.screenProps.doneCallback({isEmailConfirmed: true })
  }
  
  // eslint-disable-next-line class-methods-use-this
  verifyCode(code: integer) {
    return API.verifyEmail({ code: Number(code)})
  }
  
  handleRetry = async () => {
    this.setState({ sendingCode: true, code: '', errorMessage: '' })
    try {
      await API.sendVerificationEmail(this.props.screenProps.data)
      this.setState({ sendingCode: false, renderButton: false, resentCode: true }, this.displayDelayedRenderButton)
      
      //turn checkmark back into regular resend text
      setTimeout(() => this.setState({ ...this.state, resentCode: false }), 2000)
    } catch (e) {
      log.error(e)
      this.setState({
        errorMessage: e.message || e.response.data.message,
        sendingCode: false,
        renderButton: true,
      })
    }
  }
  
  render() {
    const { errorMessage, renderButton, loading, code, resentCode } = this.state
    const { styles } = this.props
    
    return (
      <CustomWrapper handleSubmit={this.handleSubmit} footerComponent={() => <React.Fragment />}>
        <Section.Stack grow justifyContent="flex-start">
          <Section.Row justifyContent="center" style={styles.row}>
            <Section.Title textTransform="none">{'Enter the verification code \n sent to your email'}</Section.Title>
          </Section.Row>
          <Section.Stack justifyContent="center">
            <OtpInput
              shouldAutoFocus
              numInputs={this.numInputs}
              onChange={this.handleChange}
              isInputNum={true}
              hasErrored={errorMessage !== ''}
              errorStyle={styles.errorStyle}
              value={code}
            />
            <ErrorText error={errorMessage} />
          </Section.Stack>
          <Section.Row alignItems="center" justifyContent="center" style={styles.row}>
            <CodeAction status={resentCode ? DONE : renderButton ? PENDING : WAIT} handleRetry={this.handleRetry} />
          </Section.Row>
        </Section.Stack>
        <LoadingIndicator force={loading} />
      </CustomWrapper>
    )
  }
}

const CodeAction = ({ status, handleRetry }) => {
  if (status === DONE) {
    return <Icon size={16} name="success" color="blue" />
  } else if (status === WAIT) {
    return (
      <Section.Text fontFamily="regular" fontSize={14} color="gray80Percent">
        Please wait a few seconds until the email arrives
      </Section.Text>
    )
  }
  return (
    <Section.Text fontFamily="medium" fontSize={14} color="primary" onPress={handleRetry}>
      Send me the code again
    </Section.Text>
  )
}

const getStylesFromProps = ({ theme }) => ({
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
  row: {
    marginVertical: theme.sizes.defaultQuadruple,
  },
  errorStyle: {
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.red,
    color: theme.colors.red,
  },
})

export default withStyles(getStylesFromProps)(EmailConfirmation)
