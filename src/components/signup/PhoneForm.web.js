// @flow
import React from 'react'
import { View } from 'react-native'
import { Button, IconButton, TextInput } from 'react-native-paper'
import PhoneInput from 'react-phone-number-input'
import isMobilePhone from 'validator/lib/isMobilePhone'
import 'react-phone-number-input/style.css'
import { BackButton, ContinueButton, Wrapper } from './components'

type Props = {
  // callback to report to parent component
  doneCallback: ({ phone: string }) => null,
  screenProps: any,
  navigation: any
}
type State = {
  phone: string,
  valid: boolean
}

export default class PhoneForm extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      phone: this.props.screenProps.data.phone || '',
      valid: false
    }
    this.state.valid = isMobilePhone(this.state.phone)
  }

  componentDidMount() {
    this.focusInput()
  }

  focusInput() {
    setTimeout(() => {
      const input: TextInput = document.getElementById('signup_phone')
      input.focus()

      if (window.Keyboard && window.Keyboard.show) {
        window.Keyboard.show()
      }
    }, 0)
  }

  handleChange = (phone: string) => {
    let isValid = false
    try {
      isValid = isMobilePhone(phone)
    } catch (e) {}
    this.setState({
      phone,
      valid: isValid
    })
  }

  handleSubmit = () => {
    this.props.screenProps.doneCallback({ phone: this.state.phone })
  }

  render() {
    return (
      <Wrapper>
        {/* Your screen contents depending on current tab. */}
        <PhoneInput
          id="signup_phone"
          placeholder="Enter phone number"
          value={this.state.phone}
          onChange={this.handleChange}
        />
        <ContinueButton valid={this.state.valid} handleSubmit={this.handleSubmit} />
        <BackButton {...this.props.screenProps} />
      </Wrapper>
    )
  }
}
