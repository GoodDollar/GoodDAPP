// @flow
import React from 'react'
import { debounce } from 'lodash'
import SimpleStore from '../../lib/undux/SimpleStore'
import { getDesignRelativeHeight } from '../../lib/utils/sizes'
import { userModelValidations } from '../../lib/userStorage/UserModel'

import { withStyles } from '../../lib/styles'
import InputText from '../common/form/InputText'
import Section from '../common/layout/Section'
import Text from '../common/view/Text'
import CustomWrapper from './signUpWrapper'

type Props = {
  doneCallback: ({ email: string }) => null,
  screenProps: any,
  navigation: any,
}

export type EmailRecord = {
  email: string,
  isEmailConfirmed?: boolean,
  errorMessage?: string,
  isValid: boolean,
}

type State = EmailRecord & { valid?: boolean }

class EmailForm extends React.Component<Props, State> {
  state = {
    email: this.props.screenProps.data.email || '',
    errorMessage: '',
    isValid: !!this.props.screenProps.data.email,
  }

  handleChange = (email: string) => {
    this.checkErrorsSlow()

    this.setState({ email })
  }

  handleSubmit = async () => {
    const isValid = await this.checkErrors()
    if (isValid) {
      this.props.screenProps.doneCallback({ email: this.state.email })
    }
  }

  handleEnter = (event: { nativeEvent: { key: string } }) => {
    if (event.nativeEvent.key === 'Enter' && this.state.isValid) {
      this.handleSubmit()
    }
  }

  checkErrors = () => {
    const modelErrorMessage = userModelValidations.email(this.state.email)
    const errorMessage = modelErrorMessage
    this.setState({ errorMessage }, () => this.setState({ isValid: this.state.errorMessage === '' }))
    return errorMessage === ''
  }

  checkErrorsSlow = debounce(this.checkErrors, 500)

  render() {
    const errorMessage = this.state.errorMessage || this.props.screenProps.error
    this.props.screenProps.error = undefined
    const { key } = this.props.navigation.state
    const { styles } = this.props

    return (
      <CustomWrapper
        valid={this.state.isValid}
        handleSubmit={this.handleSubmit}
        loading={this.props.screenProps.data.loading}
      >
        <Section grow justifyContent="flex-start" style={styles.row}>
          <Section.Stack justifyContent="flex-start" style={styles.container}>
            <Text
              color={'primary'}
              fontSize={getDesignRelativeHeight(12)}
              lineHeight={getDesignRelativeHeight(21)}
              letterSpacing={0.26}
              fontFamily="Roboto"
              fontWeight="bold"
              textTransform="uppercase"
              style={{ marginBottom: getDesignRelativeHeight(14) }}
            >
              Personal Details
            </Text>
            <Section.Stack justifyContent="center">
              <Section.Title
                color="darkIndigo"
                fontSize={getDesignRelativeHeight(18)}
                fontWeight="400"
                textTransform="none"
                style={{ marginVertical: 0 }}
              >
                {`Nice to meet you, ${this.props.screenProps.data.fullName}`}
              </Section.Title>
              <Section.Title
                color="darkIndigo"
                fontSize={getDesignRelativeHeight(18)}
                fontWeight="500"
                textTransform="none"
                style={{ marginVertical: 0 }}
              >
                {`What's your e-mail address?`}
              </Section.Title>
            </Section.Stack>
            <Section.Stack justifyContent="center" style={[styles.inputWrapper, styles.bottomContent]}>
              <InputText
                id={key + '_input'}
                value={this.state.email}
                onChangeText={this.handleChange}
                keyboardType="email-address"
                onKeyPress={this.handleEnter}
                error={errorMessage}
                showCleanAdornment
                autoFocus
                onSubmitEditing={this.handleSubmit}
                enablesReturnKeyAutomatically
              />
              {!errorMessage ? (
                <Text
                  color={'lightBlue'}
                  fontSize={getDesignRelativeHeight(14)}
                  lineHeight={getDesignRelativeHeight(16)}
                  letterSpacing={0.14}
                  fontFamily="Roboto"
                >
                  A verification code will be sent t this e-mail
                </Text>
              ) : null}
            </Section.Stack>
          </Section.Stack>
        </Section>
      </CustomWrapper>
    )
  }
}

const getStylesFromProps = ({ theme }) => ({
  row: {
    marginVertical: theme.sizes.defaultDouble,
  },
  inputWrapper: {
    marginVertical: getDesignRelativeHeight(50),
  },
  container: {
    minHeight: getDesignRelativeHeight(200),
    height: getDesignRelativeHeight(200),
    paddingBottom: theme.sizes.defaultDouble,
  },
})

export default withStyles(getStylesFromProps)(SimpleStore.withStore(EmailForm))
