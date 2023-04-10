// @flow

import React, { useContext, useEffect, useState } from 'react'
import { useDebouncedCallback } from 'use-debounce'
import { isMobile, isMobileNative } from '../../lib/utils/platform'
import { enhanceArgentinaCountryCode } from '../../lib/utils/phoneNumber'
import { getDesignRelativeHeight } from '../../lib/utils/sizes'
import { userModelValidations } from '../../lib/userStorage/UserModel'
import { getScreenHeight } from '../../lib/utils/orientation'
import logger from '../../lib/logger/js-logger'
import { withStyles } from '../../lib/styles'
import { getFirstWord } from '../../lib/utils/getFirstWord'
import Section from '../common/layout/Section'
import ErrorText from '../common/form/ErrorText'
import { GlobalTogglesContext } from '../../lib/contexts/togglesContext'
import useRecaptcha from '../auth/components/Recaptcha/useRecaptcha'
import FormNumberInput from './PhoneNumberInput/PhoneNumberInput'
import CustomWrapper from './signUpWrapper'

const log = logger.child({ from: 'PhoneForm' })

type PhoneFormProps = {
  screenProps: any,
  navigation: any,
}

export type MobileRecord = {
  mobile: string,
  errorMessage?: string,
  countryCode?: string | null,
  isValid: boolean,
}

const PhoneForm = ({ screenProps, navigation, styles, theme }: PhoneFormProps) => {
  const { data, doneCallback } = screenProps || {}
  const { isMobileKeyboardShown, setMobileKeyboardShown } = useContext(GlobalTogglesContext)

  // no captcha if pwdless as already passed at the flow's beginning
  const { Captcha, isValidRecaptcha } = useRecaptcha({ enabled: !(data.torusProvider || '').includes('auth0') })

  const [state, setStateValue] = useState<MobileRecord>({
    countryCode: data.countryCode,
    mobile: data.mobile || '',
    errorMessage: '',
    isValid: false,
  })

  const handleScreenKeyboard = isShown => {
    if (isMobile) {
      setMobileKeyboardShown(isShown)
    }
  }

  const setState = mergeWith => setStateValue(oldValue => ({ ...oldValue, ...mergeWith }))
  const onFocus = () => handleScreenKeyboard(true)
  const onBlur = () => handleScreenKeyboard(false)
  const validateField = () => userModelValidations.mobile(state.mobile)

  const checkErrors = () => {
    const modelErrorMessage = validateField()
    const errorMessage = modelErrorMessage
    const isValid = state.mobile && errorMessage === ''

    log.debug({ modelErrorMessage, errorMessage })
    setState({ errorMessage, isValid })

    return isValid
  }

  const checkErrorsSlow = useDebouncedCallback(checkErrors, 500)

  const handleChange = (mobile: string) => {
    checkErrorsSlow()

    setState({
      mobile: enhanceArgentinaCountryCode(mobile),
    })
  }

  const handleSubmit = () => {
    const isValid = checkErrors()

    if (isValid) {
      doneCallback({ mobile: state.mobile })
    }
  }

  const handleEnter = (event: { nativeEvent: { key: string } }) => {
    if (event.keyCode === 13 && state.isValid) {
      handleSubmit()
    }
  }

  useEffect(() => {
    checkErrors()

    if (screenProps.error) {
      screenProps.error = undefined
    }
  }, [])

  useEffect(() => {
    setState({ countryCode: data.countryCode })
  }, [data.countryCode])

  const errorMessage = state.errorMessage || screenProps.error
  const { fullName, loading } = data
  const { key } = navigation.state

  return (
    <Captcha>
      <CustomWrapper valid={state.isValid} handleSubmit={handleSubmit} loading={loading || !isValidRecaptcha}>
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
                value={state.mobile}
                onChange={handleChange}
                error={errorMessage}
                onKeyDown={handleEnter}
                country={state.countryCode}
                onTouchStart={onFocus}
                onBlur={onBlur}
                onSubmitEditing={handleSubmit}
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
              marginBottom: isMobileKeyboardShown && getScreenHeight() <= 480 ? -15 : theme.sizes.default,
            }}
          >
            {/*change fontSize only for small screen (iPhone5 , etc.)*/}
            <Section.Text fontSize={isMobileKeyboardShown && getScreenHeight() <= 480 ? 13 : 14} color="gray80Percent">
              A verification code will be sent to this number
            </Section.Text>
          </Section.Row>
        </Section>
      </CustomWrapper>
    </Captcha>
  )
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

export default withStyles(getStylesFromProps)(PhoneForm)
