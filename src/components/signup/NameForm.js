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
  errorMessage: string,
  fullName: string
}

export type NameRecord = {
  fullName: string
}

class NameForm extends React.Component<Props, State> {
  state = {
    errorMessage: '',
    fullName: this.props.screenProps.data.fullName || ''
  }
  isValid = false

  handleChange = (fullName: string) => {
    if (this.state.errorMessage !== '') {
      this.setState({ errorMessage: '' })
    }

    this.setState({ fullName })
  }

  handleSubmit = () => {
    const { fullName } = this.state
    if (this.isValid) {
      this.props.screenProps.doneCallback({ fullName })
    }
  }

  checkErrors = () => {
    const errorMessage = validateFullName(this.state.fullName)
    this.setState({ errorMessage })
  }

  handleEnter = (event: { nativeEvent: { key: string } }) => {
    if (event.nativeEvent.key === 'Enter' && this.isValid) {
      this.handleSubmit()
    }
  }

  render() {
    const { fullName, errorMessage } = this.state
    const { key } = this.props.navigation.state
    this.isValid = validateFullName(fullName) === ''
    return (
      <Wrapper valid={this.isValid} handleSubmit={this.handleSubmit}>
        <Title>{'Hi, \n Please enter your full name'}</Title>
        <TextInput
          id={key + '_input'}
          value={fullName}
          onChangeText={this.handleChange}
          onBlur={this.checkErrors}
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

const nameForm = GDStore.withStore(NameForm)
nameForm.navigationOptions = {
  title: 'Name'
}

export default nameForm
