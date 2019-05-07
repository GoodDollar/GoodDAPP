// @flow
import React from 'react'
import { HelperText, TextInput } from 'react-native-paper'
import type { Store } from 'undux'

import { userModelValidations } from '../../lib/gundb/UserModel'
import GDStore from '../../lib/undux/GDStore'
import { Title, Wrapper } from './components'

type Props = {
  // callback to report to parent component
  doneCallback: ({ email: string }) => null,
  screenProps: any,
  navigation: any,
  store: Store
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

  handleChange = (email: string) => {
    if (this.state.errorMessage !== '') {
      this.setState({ errorMessage: '' })
    }

    this.setState({ email })
  }

  handleSubmit = () => {
    if (this.state.errorMessage === '') {
      this.props.screenProps.doneCallback({ email: this.state.email })
    }
  }

  checkErrors = () => {
    const errorMessage = userModelValidations.email(this.state.email)

    this.setState({ errorMessage })
  }

  render() {
    const { errorMessage } = this.state

    return (
      <Wrapper valid={true} handleSubmit={this.handleSubmit} loading={this.props.store.get('currentScreen').loading}>
        <Title>And which email address should we use to notify you?</Title>
        <TextInput
          id="signup_email"
          label="Your Email"
          value={this.state.email}
          onChangeText={this.handleChange}
          onBlur={this.checkErrors}
          keyboardType="email-address"
          error={errorMessage !== ''}
          autoFocus
        />
        <HelperText type="error" visible={errorMessage}>
          {errorMessage}
        </HelperText>
      </Wrapper>
    )
  }
}

export default GDStore.withStore(EmailForm)
