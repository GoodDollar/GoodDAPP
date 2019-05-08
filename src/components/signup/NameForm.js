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
  isValid = false

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
    const { fullName } = this.props.store.get('name')

    if (this.isValid) {
      this.props.screenProps.doneCallback({ fullName })
    }
  }

  checkErrors = () => {
    const { store } = this.props
    const name = store.get('name')
    const errorMessage = validateFullName(name.fullName)
    this.setState({ errorMessage })
    store.set('name')(name)
  }

  handleEnter = (event: { nativeEvent: { key: string } }) => {
    if (event.nativeEvent.key === 'Enter' && this.isValid) {
      this.handleSubmit()
    }
  }

  render() {
    console.log(this.props.navigation, this.props.screenProps)
    const name = this.props.store.get('name')
    const { errorMessage } = this.state
    const { key } = this.props.navigation.state
    this.isValid = validateFullName(name.fullName) === ''
    return (
      <Wrapper valid={this.isValid} handleSubmit={this.handleSubmit}>
        <Title>{"Hi, \n What's your name?"}</Title>
        <TextInput
          id={key + '_input'}
          value={name.fullName}
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

export default GDStore.withStore(NameForm)
