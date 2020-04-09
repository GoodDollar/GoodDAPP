// @flow
import React from 'react'
import { debounce } from 'lodash'
import SimpleStore from '../../lib/undux/SimpleStore'
import { getScreenHeight } from '../../lib/utils/Orientation'
import { getDesignRelativeHeight } from '../../lib/utils/sizes'
import { userModelValidations } from '../../lib/gundb/UserModel'

import { withStyles } from '../../lib/styles'
import InputText from '../common/form/InputText'
import Section from '../common/layout/Section'
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
    const { styles, theme, store } = this.props
    const isShowKeyboard = store.get && store.get('isMobileKeyboardShown')

    return (
      <CustomWrapper
        valid={this.state.isValid}
        handleSubmit={this.handleSubmit}
        loading={this.props.screenProps.data.loading}
      >
        <Section grow justifyContent="flex-start" style={styles.row}>
          <Section.Stack justifyContent="flex-start" style={styles.container}>
            <Section.Row justifyContent="center">
              <Section.Title textTransform="none" color="darkGray" fontSize={22} fontWeight="medium">
                Please enter your email
              </Section.Title>
            </Section.Row>
            <Section.Row justifyContent="center">
              <Section.Text fontSize={14} color="gray80Percent">
                we will only notify you with important activity
              </Section.Text>
            </Section.Row>
            <Section.Row justifyContent="center" style={[styles.row, styles.bottomContent]}>
              <InputText
                id={key + '_input'}
                value={this.state.email}
                onChangeText={this.handleChange}
                keyboardType="email-address"
                onKeyPress={this.handleEnter}
                error={errorMessage}
                onCleanUpField={this.handleChange}
                autoFocus
                onSubmitEditing={this.handleSubmit}
                enablesReturnKeyAutomatically
              />
            </Section.Row>
          </Section.Stack>
          <Section.Row
            justifyContent="flex-end"
            style={{
              marginTop: 'auto',

              /*only for small screen (iPhone5 , etc.)*/
              marginBottom: isShowKeyboard && getScreenHeight() <= 480 ? -30 : theme.sizes.default,
            }}
          >
            {/*change fontSize only for small screen (iPhone5 , etc.)*/}
            <Section.Text fontSize={isShowKeyboard && getScreenHeight() <= 480 ? 13 : 14} color="gray80Percent">
              We respect your privacy and will never sell or give away your info to any third party.
            </Section.Text>
          </Section.Row>
        </Section>
      </CustomWrapper>
    )
  }
}

const getStylesFromProps = ({ theme }) => ({
  row: {
    marginVertical: theme.sizes.defaultDouble,
  },
  container: {
    minHeight: getDesignRelativeHeight(200),
    height: getDesignRelativeHeight(200),
    paddingBottom: theme.sizes.defaultDouble,
  },
})

export default withStyles(getStylesFromProps)(SimpleStore.withStore(EmailForm))
