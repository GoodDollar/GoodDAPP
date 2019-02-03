// @flow
import React from 'react'
import { TextInput } from 'react-native-paper'
import { Wrapper, Title } from './components'

type Props = {
  // callback to report to parent component
  doneCallback: ({ name: string }) => null
}
type State = {
  name: string,
  valid: boolean
}
export default class NameForm extends React.Component<Props, State> {
  constructor(props) {
    super(props)
    this.state = {
      name: this.props.screenProps.data.name || '',
      valid: false
    }
    this.state.valid = this.state.name.match(/[A-Za-z][A-Za-z'-]+(\s[A-Za-z][A-Za-z'-]+)+/) !== null
  }
  componentDidMount() {
    // this.focusInput()
  }
  focusInput() {
    setTimeout(() => {
      let inputs = document.getElementById('signup_name').focus()
      if (window.Keyboard && window.Keyboard.show) {
        window.Keyboard.show()
      }
    }, 0)
  }

  handleChange = text => {
    this.setState({
      name: text,
      valid: text.match(/[A-Za-z][A-Za-z'-]+(\s[A-Za-z][A-Za-z'-]+)+/) !== null
    })
  }

  handleSubmit = () => {
    this.props.screenProps.doneCallback({ name: this.state.name })
    // this.$f7router.navigate("/signup/email/")
  }

  render() {
    return (
      <Wrapper valid={this.state.valid} handleSubmit={this.handleSubmit}>
        <Title>{"Hi, \n What's your name?"}</Title>
        <TextInput
          id="signup_name"
          label="Your Full Name"
          value={this.state.name}
          onChangeText={this.handleChange}
          autoFocus
        />
      </Wrapper>
    )
  }
}
