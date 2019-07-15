// @flow
import React from 'react'
import { HelperText, TextInput } from 'react-native-paper'

import { validateFullName } from '../../lib/validators/validateFullName'
import { Title, Wrapper } from './components'

type Props = {
  doneCallback: ({ name: string }) => null,
  screenProps: any,
  navigation: any,
}

type State = {
  errorMessage: string,
  fullName: string,
}

export type NameRecord = {
  fullName: string,
}

class NameForm extends React.Component<Props, State> {
  state = {
    errorMessage: '',
    fullName: this.props.screenProps.data.fullName || '',
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
          autoFocus
        />
        <HelperText type="error" visible={errorMessage}>
          {errorMessage}
        </HelperText>
      </Wrapper>
    )
  }
}

NameForm.navigationOptions = {
  title: 'Name',
}

export default NameForm
