// @flow
import React from 'react'
import logger from '../../lib/logger/pino-logger'
import API from '../../lib/API/api'
import { getDesignRelativeHeight } from '../../lib/utils/sizes'
import { withStyles } from '../../lib/styles'
import type { SignupState } from './SignupState'
import SMSFormComponent from './SMSFormComponent'

const log = logger.child({ from: 'SmsForm' })

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
    renderButton: false,
    resentCode: false,
    loading: false,
    otp: Array(NumInputs).fill(null),
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

  handleChange = async (otp: array) => {
    const otpValue = otp.filter(val => val).join('')
    if (otpValue.replace(/ /g, '').length === NumInputs) {
      this.setState({
        loading: true,
        otp,
      })
      try {
        await this.verifyOTP(otpValue)
        this.handleSubmit()
      } catch (e) {
        log.error(e.message, e)

        this.setState({
          errorMessage: e.message || e,
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
    this.setState({ sendingCode: true, otp: Array(NumInputs).fill(null), errorMessage: '' })

    try {
      await API.sendOTP({ ...this.props.screenProps.data })
      this.setState({ sendingCode: false, renderButton: false, resentCode: true }, this.displayDelayedRenderButton)

      //turn checkmark back into regular resend text
      setTimeout(() => this.setState({ ...this.state, resentCode: false }), 2000)
    } catch (e) {
      log.error(e.message, e)
      this.setState({
        errorMessage: e.message || e,
        sendingCode: false,
        renderButton: true,
      })
    }
  }

  render() {
    const { errorMessage, renderButton, loading, otp, resentCode } = this.state
    const { styles } = this.props

    return (
      <SMSFormComponent
        errorMessage={errorMessage}
        renderButton={renderButton}
        loading={loading}
        otp={otp}
        resentCode={resentCode}
        styles={styles}
        NumInputs={NumInputs}
        handleSubmit={this.handleSubmit}
        handleChange={this.handleChange}
        handleRetry={this.handleRetry}
        mainText={'Enter the verification code\nsent to your phone'}
        waitText={'Please wait a few seconds until the SMS arrives'}
        aside={[3]}
      />
    )
  }
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
})

export default withStyles(getStylesFromProps)(SmsForm)
