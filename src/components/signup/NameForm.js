// @flow
import React from 'react'
import { debounce } from 'lodash'
import { validateFullName } from '../../lib/validators/validateFullName'
import { getDesignRelativeHeight } from '../../lib/utils/sizes'
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
  constructor(props) {
    super(props)

    const fullName = props.screenProps.data.fullName || ''
    const errorMessage = validateFullName(fullName)

    this.state = {
      errorMessage: '',
      fullName,
      isValid: errorMessage === '',
    }
  }

  input = undefined

  handleChange = (fullName: string) => {
    this.checkErrorsSlow()
    this.setState({ fullName })
  }

  handleSubmit = () => {
    const { fullName } = this.state
    const isValid = this.checkErrors()
    if (isValid) {
      this.props.screenProps.doneCallback({ fullName })
    }
  }

  checkErrors = () => {
    const errorMessage = validateFullName(this.state.fullName)
    this.setState({ errorMessage, isValid: errorMessage === '' })
    return errorMessage === ''
  }

  checkErrorsSlow = debounce(this.checkErrors, 500)

  handleEnter = (event: { nativeEvent: { key: string } }) => {
    if (event.nativeEvent.key === 'Enter') {
      this.handleSubmit()
    }
  }

  render() {
    const { fullName, errorMessage } = this.state
    const { key } = this.props.navigation.state
    const { styles } = this.props
    const { loading } = this.props.screenProps.data
    return (
      <CustomWrapper
        valid={this.state.isValid}
        loading={loading}
        handleSubmit={this.handleSubmit}
        style={this.props.styles.transparentBackground}
      >
        <Section grow justifyContent="flex-start" style={styles.transparentBackground}>
          <Section.Stack justifyContent="flex-start" style={styles.container}>
            <Section.Row justifyContent="center" style={styles.row}>
              <Section.Title color="darkGray" fontSize={22} fontWeight="medium" textTransform="none">
                {'Hi, nice to meet you.\n Please enter your full name'}
              </Section.Title>
            </Section.Row>
            <Section.Row justifyContent="center" style={styles.bottomRow}>
              <InputText
                id={key + '_input'}
                value={fullName}
                onChangeText={this.handleChange}
                error={errorMessage}
                onKeyPress={this.handleEnter}
                onCleanUpField={this.handleChange}
                autoFocus
                style={styles.transparentBackground}
                enablesReturnKeyAutomatically
                onSubmitEditing={this.handleSubmit}
              />
            </Section.Row>
          </Section.Stack>
        </Section>
      </CustomWrapper>
    )
  }
}

NameForm.navigationOptions = {
  title: 'Name',
}

const getStylesFromProps = ({ theme }) => ({
  transparentBackground: {
    backgroundColor: 'transparent',
  },
  row: {
    marginVertical: theme.sizes.defaultDouble,
  },
  container: {
    minHeight: getDesignRelativeHeight(200),
    height: getDesignRelativeHeight(200),
  },
  bottomRow: {
    marginTop: 'auto',
    marginBottom: theme.sizes.default,
  },
})

export default withStyles(getStylesFromProps)(NameForm)
