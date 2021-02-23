// @flow

import React from 'react'
import { debounce } from 'lodash'
import { isMobile, isMobileNative } from '../../lib/utils/platform'
import { enhanceArgentinaCountryCode } from '../../lib/utils/phoneNumber'
import { getDesignRelativeHeight } from '../../lib/utils/sizes'
import { userModelValidations } from '../../lib/gundb/UserModel'
import { getScreenHeight } from '../../lib/utils/orientation'
import logger from '../../lib/logger/pino-logger'
import SimpleStore from '../../lib/undux/SimpleStore'
import { withStyles } from '../../lib/styles'
import Config from '../../config/config'
import { getFirstWord } from '../../lib/utils/getFirstWord'
import Section from '../common/layout/Section'
import ErrorText from '../common/form/ErrorText'
import FormNumberInput from './PhoneNumberInput/PhoneNumberInput'
import CustomWrapper from './signUpWrapper'

const log = logger.child({ from: 'PhoneForm' })

type Props = {
  doneCallback: ({ phone: string }) => null,
  screenProps: any,
  navigation: any,
}

export type MobileRecord = {
  mobile: string,
  errorMessage?: string,
  countryCode?: string | null,
  isValid: boolean,
}

type State = MobileRecord

class PhoneForm extends React.Component<Props, State> {
  state = {
    mobile: this.props.screenProps.data.mobile || '',
    errorMessage: '',
    countryCode: this.props.screenProps.data.countryCode,
    isValid: false,
  }

  onFocus = () => {
    const { store } = this.props
    if (isMobile) {
      store.set('isMobileKeyboardShown')(true)
    }
  }

  onBlur = () => {
    const { store } = this.props
    if (isMobile) {
      store.set('isMobileKeyboardShown')(false)
    }
  }

  componentDidMount() {
    this.setState({
      isValid: this.checkErrors(),
    })
  }

  componentDidUpdate() {
    if (this.props.screenProps.data.countryCode !== this.state.countryCode) {
      this.setState({
        countryCode: this.props.screenProps.data.countryCode,
      })
    }
  }

  handleChange = (mobile: string) => {
    this.checkErrorsSlow()

    this.setState({
      mobile: enhanceArgentinaCountryCode(mobile),
    })
  }

  handleSubmit = () => {
    const isValid = this.checkErrors()
    if (isValid) {
      this.props.screenProps.doneCallback({ mobile: this.state.mobile })
    }
  }

  handleEnter = (event: { nativeEvent: { key: string } }) => {
    if (event.keyCode === 13 && this.state.isValid) {
      this.handleSubmit()
    }
  }

  validateField = () => {
    return userModelValidations.mobile(this.state.mobile)
  }

  checkErrors = () => {
    const modelErrorMessage = this.validateField()
    const errorMessage = modelErrorMessage
    log.debug({ modelErrorMessage, errorMessage, Config })
    const isValid = this.state.mobile && errorMessage === ''
    this.setState({ errorMessage, isValid })
    return isValid
  }

  checkErrorsSlow = debounce(this.checkErrors, 500)

  render() {
    const errorMessage = this.state.errorMessage || this.props.screenProps.error
    this.props.screenProps.error = undefined

    const { key } = this.props.navigation.state
    const { styles, store, theme } = this.props
    const { fullName, loading } = this.props.screenProps.data
    const isShowKeyboard = store.get && store.get('isMobileKeyboardShown')
    return (
      <CustomWrapper valid={this.state.isValid} handleSubmit={this.handleSubmit} loading={loading}>
        <Section grow justifyContent="flex-start" style={styles.transparentBackground}>
          <Section.Stack justifyContent="flex-start" style={styles.container}>
            <Section.Row justifyContent="center">
              <Section.Title color="darkGray" fontSize={22} fontWeight="medium" textTransform="none">
                {`${getFirstWord(fullName)},\nenter your phone number\nso we could verify you`}
              </Section.Title>
            </Section.Row>
            <Section.Stack justifyContent="center" style={styles.column}>
              <FormNumberInput
                id={key + '_input'}
                value={this.state.mobile}
                onChange={this.handleChange}
                error={errorMessage}
                onKeyDown={this.handleEnter}
                country={this.state.countryCode}
                onTouchStart={this.onFocus}
                onBlur={this.onBlur}
                onSubmitEditing={this.handleSubmit}
                enablesReturnKeyAutomatically
                autoFocus
                textStyle={isMobileNative && errorMessage ? styles.inputError : undefined}
              />
              <ErrorText error={errorMessage} style={styles.customError} />
            </Section.Stack>
          </Section.Stack>
          <Section.Row
            justifyContent="center"
            style={{
              marginTop: 'auto',

              /*only for small screen (iPhone5 , etc.)*/
              marginBottom: isShowKeyboard && getScreenHeight() <= 480 ? -15 : theme.sizes.default,
            }}
          >
            {/*change fontSize only for small screen (iPhone5 , etc.)*/}
            <Section.Text fontSize={isShowKeyboard && getScreenHeight() <= 480 ? 13 : 14} color="gray80Percent">
              A verification code will be sent to this number
            </Section.Text>
          </Section.Row>
        </Section>
      </CustomWrapper>
    )
  }
}

const getStylesFromProps = ({ theme }) => ({
  column: {
    marginBottom: theme.sizes.default,
    marginTop: 'auto',
  },
  customError: {
    marginLeft: 48,
    marginTop: theme.paddings.defaultMargin,
  },
  inputError: {
    color: theme.colors.red,
    borderColor: theme.colors.red,
  },
  container: {
    minHeight: getDesignRelativeHeight(200),
    height: getDesignRelativeHeight(200),
  },
  bottomRow: {
    marginTop: 'auto',
  },
  transparentBackground: {
    backgroundColor: 'transparent',
  },
})

export default withStyles(getStylesFromProps)(SimpleStore.withStore(PhoneForm))
