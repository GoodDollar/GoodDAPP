// @flow
import React from 'react'
import { HelperText, TextInput } from 'react-native-paper'

import { userModelValidations } from '../../lib/gundb/UserModel'
import { Title, Wrapper } from './components'

type Props = {
  doneCallback: ({ email: string }) => null,
  screenProps: any,
  navigation: any
}

export type EmailRecord = {
  email: string,
  isEmailConfirmed?: boolean,
  errorMessage?: string
}

type State = EmailRecord & { valid?: boolean }

class EmailForm extends React.Component<Props, State> {
  state = {
    email: this.props.screenProps.data.email || '',
    errorMessage: ''
  }

  isValid = false

  handleChange = (email: string) => {
    if (this.state.errorMessage !== '') {
      this.setState({ errorMessage: undefined })
    }

    this.setState({ email })
  }

  handleSubmit = () => {
    if (this.isValid) {
      this.props.screenProps.doneCallback({ email: this.state.email })
    }
  }

  handleEnter = (event: { nativeEvent: { key: string } }) => {
    if (event.nativeEvent.key === 'Enter' && this.isValid) {
      this.handleSubmit()
    }
  }

  checkErrors = () => {
    const errorMessage = userModelValidations.email(this.state.email)

    this.setState({ errorMessage })
  }

  render() {
    const errorMessage = this.state.errorMessage || this.props.screenProps.error
    this.props.screenProps.error = undefined
    this.isValid = userModelValidations.email(this.state.email) === ''
    const { key } = this.props.navigation.state

    return (
      <Wrapper valid={this.isValid} handleSubmit={this.handleSubmit} loading={this.props.screenProps.data.loading}>
        <Title>And which email address should we use to notify you of important activity?</Title>
        <TextInput
          id={key + '_input'}
          value={this.state.email}
          onChangeText={this.handleChange}
          onBlur={this.checkErrors}
          keyboardType="email-address"
          error={errorMessage !== ''}
          onKeyPress={this.handleEnter}
          autoFocus
        />
        <HelperText type="error" visible={errorMessage}>
          {errorMessage}
        </HelperText>
      </Wrapper>
    )
  }
}

export default EmailForm
