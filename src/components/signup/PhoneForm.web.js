// @flow
import React from 'react'
import PhoneInput from 'react-phone-number-input'
import isMobilePhone from '../../lib/validators/isMobilePhone'
import 'react-phone-number-input/style.css'
import { Title, Wrapper, Description } from './components'
import { TextInput } from 'react-native-paper'

type Props = {
  // callback to report to parent component
  doneCallback: ({ phone: string }) => null,
  screenProps: any,
  navigation: any
}

export type MobileRecord = {
  mobile: string
}

type State = MobileRecord & { valid?: boolean }

export default class PhoneForm extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      mobile: this.props.screenProps.data.mobile || '',
      valid: false
    }
    this.state.valid = isMobilePhone(this.state.mobile)
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

  handleChange = (mobile: string) => {
    let isValid = false
    try {
      isValid = isMobilePhone(mobile)
    } catch (e) {}
    this.setState({
      mobile,
      valid: isValid
    })
  }

  handleSubmit = () => {
    this.props.screenProps.doneCallback({ mobile: this.state.mobile })
  }

  render() {
    return (
      <Wrapper valid={this.state.valid} handleSubmit={this.handleSubmit}>
        <Title>{`${this.props.screenProps.data.fullName}, \n May we have your number please?`}</Title>

        <PhoneInput
          id="signup_phone"
          placeholder="Enter phone number"
          value={this.state.mobile}
          onChange={this.handleChange}
        />
        <Description>We will shortly send you a verification code to this number</Description>
      </Wrapper>
    )
  }
}
