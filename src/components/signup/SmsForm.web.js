// @flow
import React from 'react'
import { View } from 'react-native'
import OtpInput from 'react-otp-input'
import normalize from '../../lib/utils/normalizeText'
import logger from '../../lib/logger/pino-logger'
import API from '../../lib/API/api'
import { withStyles } from '../../lib/styles'
import CustomButton from '../common/buttons/CustomButton'
import Icon from '../common/view/Icon'
import LoadingIndicator from '../common/view/LoadingIndicator'
import Section from '../common/layout/Section'
import { ErrorText } from '../common/form/InputText'
import CustomWrapper from './signUpWrapper'
import type { SignupState } from './SignupState'

const log = logger.child({ from: 'SmsForm.web' })

const DONE = 'DONE'
const WAIT = 'WAIT'
const PENDING = 'PENDING'

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
  loading: boolean,
  otp: string | number,
}

class SmsForm extends React.Component<Props, State> {
  state = {
    smsValidated: false,
    sentSMS: false,
    errorMessage: '',
    sendingCode: false,
    renderButton: false,
    resentCode: false,
    loading: false,
    otp: undefined,
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

  handleChange = async (otp: string | number) => {
    const otpValue = otp.toString()
    if (otpValue.length === this.numInputs) {
      this.setState({
        loading: true,
        otp,
      })
      try {
        await this.verifyOTP(otpValue)
        this.handleSubmit()
      } catch (e) {
        log.error({ e })

        this.setState({
          errorMessage: e.message || e.response.data.message,
        })
      } finally {
        this.setState({ loading: false })
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
    const { errorMessage, renderButton, loading, otp, resentCode } = this.state
    const { styles } = this.props

    return (
      <CustomWrapper handleSubmit={this.handleSubmit} footerComponent={() => <React.Fragment />}>
        <Section.Stack grow justifyContent="flex-start">
          <Section.Row justifyContent="center" style={styles.row}>
            <Section.Title textTransform="none">{'Enter the verification code \n sent to your phone'}</Section.Title>
          </Section.Row>
          <Section.Stack justifyContent="center">
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
            <ErrorText error={errorMessage} />
          </Section.Stack>
          <Section.Row alignItems="center" justifyContent="center" style={styles.row}>
            <SMSAction
              status={resentCode ? DONE : renderButton ? PENDING : WAIT}
              handleRetry={this.handleRetry}
              styles={styles}
            />
          </Section.Row>
        </Section.Stack>
        <LoadingIndicator force={loading} />
      </CustomWrapper>
    )
  }
}

const SMSAction = ({ status, handleRetry, styles }) => {
  if (status === DONE) {
    return (
      <CustomButton>
        <View style={styles.iconButtonWrapper}>
          <Icon size={16} name="success" color="white" />
        </View>
      </CustomButton>
    )
  } else if (status === WAIT) {
    return (
      <Section.Text fontFamily="regular" fontSize={14} color="gray80Percent">
        Please wait a few seconds until the SMS arrives
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

export default withStyles(getStylesFromProps)(SmsForm)
