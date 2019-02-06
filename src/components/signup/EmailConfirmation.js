// @flow
import React from 'react'
import { Wrapper, Title, Description, LinkButton, NextButton } from './components'
import { StyleSheet } from 'react-native'
import { normalize } from 'react-native-elements'

type Props = {
  screenProps: any
}
type State = {}
export default class EmailConfirmation extends React.Component<Props, State> {
  handleSubmit = () => {
    this.props.screenProps.doneCallback({ isEmailConfirmed: true })
  }
  render() {
    return (
      <Wrapper
        handleSubmit={this.handleSubmit}
        footerComponent={props => {
          return (
            <React.Fragment>
              <Description style={styles.description}>{'Please click the link to approve the email'}</Description>
              <NextButton valid={true} handleSubmit={props.handleSubmit}>
                Open your email app
              </NextButton>
              <LinkButton onPress={() => console.log('Link button')}>Send mail again</LinkButton>
            </React.Fragment>
          )
        }}
      >
        <Description>{"We've sent an email to:"}</Description>
        <Title>{this.props.screenProps.data.email}</Title>
      </Wrapper>
    )
  }
}

const styles = StyleSheet.create({
  description: {
    marginBottom: normalize(20)
  }
})
