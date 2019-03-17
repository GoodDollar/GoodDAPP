// @flow
import React from 'react'
import { Wrapper, Title } from './components'

type Props = {
  screenProps: any
}
type State = {}
export default class SignupCompleted extends React.Component<Props, State> {
  handleSubmit = () => {
    this.props.screenProps.doneCallback({ isEmailConfirmed: true })
  }
  render() {
    return (
      <Wrapper
        valid={true}
        handleSubmit={this.handleSubmit}
        submitText="Let's start!"
        showPrivacyPolicy={false}
        loading={this.props.screenProps.data.loading}
      >
        <Title>{`That's great,\nThanks ${this.props.screenProps.data.fullName}!`}</Title>
      </Wrapper>
    )
  }
}
