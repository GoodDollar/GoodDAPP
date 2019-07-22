// @flow
import React from 'react'
import { validateFullName } from '../../lib/validators/validateFullName'
import { withStyles } from '../../lib/styles'
import InputText from '../common/form/InputText'
import Section from '../common/layout/Section'
import CustomWrapper from './signUpWrapper'

type Props = {
  doneCallback: ({ name: string }) => null,
  screenProps: any,
  navigation: any,
  styles: any,
}

type State = {
  errorMessage: string,
  fullName: string,
}

export type NameRecord = {
  fullName: string,
}

class NameForm extends React.Component<Props, State> {
  state = {
    errorMessage: '',
    fullName: this.props.screenProps.data.fullName || '',
  }

  isValid = false

  handleChange = (fullName: string) => {
    if (this.state.errorMessage !== '') {
      this.setState({ errorMessage: '' })
    }

    this.setState({ fullName })
  }

  handleSubmit = () => {
    const { fullName } = this.state
    if (this.isValid) {
      this.props.screenProps.doneCallback({ fullName })
    }
  }

  checkErrors = () => {
    const errorMessage = validateFullName(this.state.fullName)
    this.setState({ errorMessage })
  }

  handleEnter = (event: { nativeEvent: { key: string } }) => {
    if (event.nativeEvent.key === 'Enter' && this.isValid) {
      this.handleSubmit()
    }
  }

  cleanUpField = fullName => {
    this.setState({ fullName }, this.checkErrors)
  }

  render() {
    const { fullName, errorMessage } = this.state
    const { key } = this.props.navigation.state
    this.isValid = validateFullName(fullName) === ''
    return (
      <CustomWrapper valid={this.isValid} handleSubmit={this.handleSubmit}>
        <Section.Stack grow justifyContent="flex-start">
          <Section.Row justifyContent="center" style={this.props.styles.row}>
            <Section.Title textTransform="none">{'Hi, Please enter your full name'}</Section.Title>
          </Section.Row>
          <Section.Row justifyContent="center">
            <InputText
              id={key + '_input'}
              value={fullName}
              onChangeText={this.handleChange}
              onBlur={this.checkErrors}
              error={errorMessage}
              onKeyPress={this.handleEnter}
              onCleanUpField={this.cleanUpField}
              autoFocus
            />
          </Section.Row>
        </Section.Stack>
      </CustomWrapper>
    )
  }
}

NameForm.navigationOptions = {
  title: 'Name',
}

const getStylesFromProps = ({ theme }) => ({
  row: {
    marginVertical: theme.sizes.defaultQuadruple,
  },
})

export default withStyles(getStylesFromProps)(NameForm)
