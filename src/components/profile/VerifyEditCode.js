// @flow
import React from 'react'
import _get from 'lodash/get'
import logger from '../../lib/logger/pino-logger'
import API from '../../lib/API/api'
import { getDesignRelativeHeight } from '../../lib/utils/sizes'
import { withStyles } from '../../lib/styles'
import SMSFormComponent from '../signup/SMSFormComponent'

const log = logger.child({ from: 'SmsForm' })

export type SMSRecord = {
  smsValidated: boolean,
  sentSMS?: boolean,
}

const NumInputs: number = 6

class VerifyEditCode extends React.Component {
  state = {
    smsValidated: false,
    sentSMS: false,
    errorMessage: '',
    sendingCode: false,
    renderButton: false,
    resentCode: false,
    loading: false,
    code: Array(NumInputs).fill(null),
    requestFn: undefined,
    resendCodeFn: undefined,
    fieldToShow: '',
  }

  componentDidMount() {
    const { navigation } = this.props
    const field = _get(navigation, 'state.params.field')
    let requestFn
    let resendCodeFn
    let fieldToShow

    switch (field) {
      case 'phone':
        requestFn = API.verifyNewMobile
        resendCodeFn = API.sendNewOTP
        fieldToShow = 'phone'
        break

      case 'email':
      default:
        requestFn = API.verifyNewEmail
        resendCodeFn = API.sendVerificationForNewEmail
        fieldToShow = 'email'
        break
    }

    this.setState({
      requestFn,
      resendCodeFn,
      fieldToShow,
    })
  }

  componentDidUpdate() {
    if (!this.state.renderButton) {
      this.renderDelayedButton()
    }
  }

  renderDelayedButton = () => {
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
        const { requestFn } = this.state

        await requestFn({ code: codeValue })

        this.handleSubmit()
      } catch (e) {
        log.error('Failed to verify top:', e.message, e)

        this.setState({
          errorMessage: e.message || e,
        })
      } finally {
        this.setState({ loading: false })
      }
    } else {
      this.setState({
        errorMessage: '',
        code,
      })
    }
  }

  handleSubmit = () => {
    // show success popup - redirect to prodile on dismiss
  }

  handleRetry = async () => {
    this.setState({ sendingCode: true, code: Array(NumInputs).fill(null), errorMessage: '' })

    try {
      const { resendCodeFn } = this.state

      await resendCodeFn({ ...this.props.screenProps.data })
      this.setState({ sendingCode: false, renderButton: false, resentCode: true }, this.renderDelayedButton)

      //turn checkmark back into regular resend text
      setTimeout(() => this.setState({ ...this.state, resentCode: false }), 2000)
    } catch (e) {
      log.error('Failed to resend code:', e.message, e)

      this.setState({
        errorMessage: e.message || e,
        sendingCode: false,
        renderButton: true,
      })
    }
  }

  render() {
    const { errorMessage, renderButton, loading, code, resentCode, fieldToShow } = this.state
    const { styles } = this.props
    const mainText = `Enter the verification code\nsent to your ${fieldToShow}`

    return (
      <SMSFormComponent
        errorMessage={errorMessage}
        renderButton={renderButton}
        loading={loading}
        otp={code}
        resentCode={resentCode}
        styles={styles}
        NumInputs={NumInputs}
        handleSubmit={this.handleSubmit}
        handleChange={this.handleChange}
        handleRetry={this.handleRetry}
        mainText={mainText}
      />
    )
  }
}

VerifyEditCode.navigationOptions = {
  title: 'Edit Profile',
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

export default withStyles(getStylesFromProps)(VerifyEditCode)
