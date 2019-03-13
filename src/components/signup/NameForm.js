// @flow
import React from 'react'
import { TextInput } from 'react-native-paper'
import type { Store } from 'undux'

import GDStore from '../../lib/undux/GDStore'
import { Title, Wrapper } from './components'

type Props = {
  // callback to report to parent component
  doneCallback: ({ name: string }) => null,
  screenProps: any,
  navigation: any,
  store: Store
}

export type NameRecord = {
  fullName: string
}

class NameForm extends React.Component<Props, {}> {
  focusInput() {
    setTimeout(() => {
      const input: TextInput = document.getElementById('signup_name')
      input.focus()

      if (window.Keyboard && window.Keyboard.show) {
        window.Keyboard.show()
      }
    }, 0)
  }

  handleChange = (fullName: string) => {
    const { store } = this.props
    const name = store.get('name')

    name.fullName = fullName
    name.valid = fullName.match(/[A-Za-z][A-Za-z'-]+(\s[A-Za-z][A-Za-z'-]+)+/) !== null

    store.set('name')(name)
  }

  handleSubmit = () => {
    this.props.screenProps.doneCallback({ fullName: this.props.store.get('name').fullName })
    // this.$f7router.navigate("/signup/email/")
  }

  render() {
    const name = this.props.store.get('name')

    return (
      <Wrapper valid={name.valid} handleSubmit={this.handleSubmit}>
        <Title>{"Hi, \n What's your name?"}</Title>
        <TextInput
          id="signup_name"
          label="Your Full Name"
          value={name.fullName}
          onChangeText={this.handleChange}
          autoFocus
        />
      </Wrapper>
    )
  }
}

export default GDStore.withStore(NameForm)
