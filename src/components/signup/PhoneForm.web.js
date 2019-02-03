// @flow
import React from 'react'
import PhoneInput from 'react-phone-number-input'
import isMobilePhone from 'validator/lib/isMobilePhone'
import 'react-phone-number-input/style.css'
import { Title, Wrapper, Description } from './components'

type Props = {
  // callback to report to parent component
  doneCallback: ({ phone: string }) => null
}
type State = {
  phone: string,
  valid?: boolean
}
export default class PhoneForm extends React.Component<Props, State> {
  constructor(props) {
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
      let inputs = document.getElementById('signup_phone').focus()
      if (window.Keyboard && window.Keyboard.show) {
        window.Keyboard.show()
      }
    }, 0)
  }

  handleChange = phone => {
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
      <Wrapper valid={this.state.valid} handleSubmit={this.handleSubmit}>
        <Title>{`${this.props.screenProps.data.name}, \n May we have your number please?`}</Title>

        <PhoneInput
          id="signup_phone"
          placeholder="Enter phone number"
          value={this.state.phone}
          onChange={this.handleChange}
        />
        <Description>We will shortly send you a verification code to this number</Description>
      </Wrapper>
    )
  }
}
