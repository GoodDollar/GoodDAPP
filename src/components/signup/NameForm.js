// @flow
import React from 'react'
import { HelperText, TextInput } from 'react-native-paper'
import type { Store } from 'undux'

import GDStore from '../../lib/undux/GDStore'
import { validateFullName } from '../../lib/validators/validateFullName'
import { Title, Wrapper } from './components'

type Props = {
  // callback to report to parent component
  doneCallback: ({ name: string }) => null,
  screenProps: any,
  navigation: any,
  store: Store
}

type State = {
  errorMessage: string
}

export type NameRecord = {
  fullName: string
}

class NameForm extends React.Component<Props, State> {
  state = {
    errorMessage: ''
  }

  handleChange = (fullName: string) => {
    const { store } = this.props
    const name = store.get('name')

    if (this.state.errorMessage !== '') {
      this.setState({ errorMessage: '' })
    }

    name.fullName = fullName
    store.set('name')(name)
  }

  handleSubmit = () => {
    const { fullName, valid } = this.props.store.get('name')

    if (valid) {
      this.props.screenProps.doneCallback({ fullName })
    }
  }

  checkErrors = () => {
    const { store } = this.props
    const name = store.get('name')
    const errorMessage = validateFullName(name.fullName)

    this.setState({ errorMessage })

    name.valid = errorMessage === ''
    store.set('name')(name)
  }

  render() {
    const name = this.props.store.get('name')
    const { errorMessage } = this.state

    return (
      <Wrapper valid={true} handleSubmit={this.handleSubmit}>
        <Title>{"Hi, \n What's your name?"}</Title>
        <TextInput
          id="signup_name"
          label="Your Full Name"
          value={name.fullName}
          onChangeText={this.handleChange}
          onBlur={this.checkErrors}
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

export default GDStore.withStore(NameForm)
