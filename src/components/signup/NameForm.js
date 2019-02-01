// @flow
import React from 'react'
import { View } from 'react-native'
import { TextInput, Button } from 'react-native-paper'
import { BackButton, ContinueButton, Wrapper } from './components'

type Props = {
  // callback to report to parent component
  doneCallback: ({ name: string }) => null,
  screenProps: any,
  navigation: any
}

export type NameRecord = {
  fullName: string
}

type State = NameRecord & { valid?: boolean }

export default class NameForm extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      fullName: this.props.screenProps.data.fullName || '',
      valid: false
    }
    this.state.valid = this.state.fullName.match(/[A-Za-z][A-Za-z'-]+(\s[A-Za-z][A-Za-z'-]+)+/) !== null
  }
  componentDidMount() {
    // this.focusInput()
  }

  focusInput() {
    setTimeout(() => {
      const input: TextInput = document.getElementById('signup_name')
      input.focus()

      if (window.Keyboard && window.Keyboard.show) {
        window.Keyboard.show()
      }
    }, 0)
  }

  handleChange = (text: string) => {
    this.setState({
      fullName: text,
      valid: text.match(/[A-Za-z][A-Za-z'-]+(\s[A-Za-z][A-Za-z'-]+)+/) !== null
    })
  }

  handleSubmit = () => {
    this.props.screenProps.doneCallback({ fullName: this.state.fullName })
    // this.$f7router.navigate("/signup/email/")
  }

  render() {
    return (
      <Wrapper>
        {/* Your screen contents depending on current tab. */}
        <TextInput
          id="signup_name"
          label="Your Full Name"
          value={this.state.fullName}
          onChangeText={this.handleChange}
          autoFocus
        />

        <ContinueButton valid={this.state.valid} handleSubmit={this.handleSubmit} />
        <BackButton {...this.props.screenProps} />
      </Wrapper>
    )
  }
}
