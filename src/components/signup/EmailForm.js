// @flow
import React from 'react'
import { HelperText, TextInput } from 'react-native-paper'
import debounce from 'lodash/debounce'
import { userModelValidations } from '../../lib/gundb/UserModel'
import userStorage from '../../lib/gundb/UserStorage'
import Config from '../../config/config'
import { Title, Wrapper } from './components'

type Props = {
  doneCallback: ({ email: string }) => null,
  screenProps: any,
  navigation: any,
}

export type EmailRecord = {
  email: string,
  isEmailConfirmed?: boolean,
  errorMessage?: string,
  isValid: boolean,
}

type State = EmailRecord & { valid?: boolean }

class EmailForm extends React.Component<Props, State> {
  state = {
    email: this.props.screenProps.data.email || '',
    errorMessage: '',
    isValid: false,
  }

  handleChange = (email: string) => {
    this.checkErrorsSlow()

    this.setState({ email })
  }

  handleSubmit = async () => {
    const isValid = await this.checkErrors()
    if (isValid) {
      this.props.screenProps.doneCallback({ email: this.state.email })
    }
  }

  handleEnter = (event: { nativeEvent: { key: string } }) => {
    if (event.nativeEvent.key === 'Enter' && this.state.isValid) {
      this.handleSubmit()
    }
  }

  checkErrors = async () => {
    const modelErrorMessage = userModelValidations.email(this.state.email)
    const isValidIndexValue =
      Config.skipEmailVerification || (await userStorage.isValidValue('email', this.state.email))
    const errorMessage = modelErrorMessage || (isValidIndexValue ? '' : 'Unavailable email')
    this.setState({ errorMessage }, () => this.setState({ isValid: this.state.errorMessage === '' }))
    return errorMessage === ''
  }

  checkErrorsSlow = debounce(this.checkErrors, 500)

  render() {
    const errorMessage = this.state.errorMessage || this.props.screenProps.error
    this.props.screenProps.error = undefined
    const { key } = this.props.navigation.state

    return (
      <Wrapper
        valid={this.state.isValid}
        handleSubmit={this.handleSubmit}
        loading={this.props.screenProps.data.loading}
      >
        <Title>And which email address should we use to notify you of important activity?</Title>
        <TextInput
          id={key + '_input'}
          value={this.state.email}
          onChangeText={this.handleChange}
          keyboardType="email-address"
          error={errorMessage !== ''}
          onKeyPress={this.handleEnter}
        />
        <HelperText type="error" visible={errorMessage}>
          {errorMessage}
        </HelperText>
      </Wrapper>
    )
  }
}

export default EmailForm
