// @flow
import React from 'react'
import { StyleSheet } from 'react-native'
import { Wrapper, Title, Description } from './components'
import { normalize } from 'react-native-elements'

type Props = {}
type State = {}
export default class SignupCompleted extends React.Component<Props, State> {
  handleSubmit = () => {
    this.props.screenProps.doneCallback({ isEmailConfirmed: true })
  }
  render() {
    return (
      <Wrapper valid={true} handleSubmit={this.handleSubmit} submitText="Let's start!" showPrivacyPolicy={false}>
        <Title>{"That's great,\nThanks John!"}</Title>
      </Wrapper>
    )
  }
}
