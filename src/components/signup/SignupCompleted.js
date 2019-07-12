// @flow
import React from 'react'
import { Title, Wrapper } from './components'

type Props = {
  screenProps: any,
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
        loading={this.props.screenProps.data.loading}
      >
        <Title>{`That's great, you're all set.\nThanks ${this.props.screenProps.data.fullName.split(' ')[0]}!`}</Title>
      </Wrapper>
    )
  }
}
