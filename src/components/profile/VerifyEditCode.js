// @flow
import React, { useEffect, useState } from 'react'
import _get from 'lodash/get'
import logger from '../../lib/logger/pino-logger'
import API from '../../lib/API/api'
import { getDesignRelativeHeight } from '../../lib/utils/sizes'
import { withStyles } from '../../lib/styles'
import SMSFormComponent from '../signup/SMSFormComponent'
import userStorage from '../../lib/gundb/UserStorage'

const log = logger.child({ from: 'SmsForm' })

export type SMSRecord = {
  smsValidated: boolean,
  sentSMS?: boolean,
}

const NumInputs: number = 6

const VerifyEditCode = props => {
  const [renderButton, setRenderButton] = useState(false)
  const [loading, setLoading] = useState(false)
  const [code, setCode] = useState(Array(NumInputs).fill(null))
  const [errorMessage, setErrorMessage] = useState('')
  const [resentCode, setResentCode] = useState(false)

  const { navigation, styles } = props
  const field = _get(navigation, 'state.params.field')
  const content = _get(navigation, 'state.params.content')
  let requestFn
  let resendCodeFn
  let fieldToShow
  let fieldToSave
  let waitTextInst

  switch (field) {
    case 'phone':
      requestFn = 'verifyNewMobile'
      resendCodeFn = 'sendNewOTP'
      fieldToShow = 'phone'
      waitTextInst = 'SMS'
      fieldToSave = 'mobile'
      break

    case 'email':
    default:
      requestFn = 'verifyNewEmail'
      resendCodeFn = 'sendVerificationForNewEmail'
      fieldToShow = 'email'
      fieldToSave = 'email'
      waitTextInst = 'email'
      break
  }

  useEffect(() => {
    if (!renderButton) {
      renderDelayedButton()
    }
  }, [renderButton])

  const renderDelayedButton = () => {
    setTimeout(() => {
      setRenderButton(true)
    }, 10000)
  }

  const handleChange = async (code: array) => {
    const codeValue = code.filter(val => val).join('')

    if (codeValue.replace(/ /g, '').length === NumInputs) {
      setLoading(true)
      setCode(code)

      try {
        await API[requestFn](codeValue, content)

        await handleSubmit()
      } catch (e) {
        log.error('Failed to verify top:', e.message, e)

        setErrorMessage(e.message || e)
      } finally {
        setLoading(false)
      }
    } else {
      setErrorMessage('')
      setCode(code)
    }
  }

  const handleSubmit = async () => {
    const privacy = await userStorage.getFieldPrivacy(fieldToSave)
    await userStorage.setProfileField(fieldToSave, content, privacy)

    navigation.navigate('Profile')
  }

  const handleRetry = async () => {
    setCode(Array(NumInputs).fill(null))
    setErrorMessage('')

    try {
      await API[resendCodeFn](content)

      setRenderButton(false)
      setResentCode(true)

      renderDelayedButton()

      //turn checkmark back into regular resend text
      setTimeout(() => setResentCode(false), 2000)
    } catch (e) {
      log.error('Failed to resend code:', e.message, e)

      setErrorMessage(e.message || e)
      setRenderButton(true)
    }
  }

  const mainText = `Enter the verification code\nsent to your ${fieldToShow}`
  const waitText = `Please wait a few seconds until the ${waitTextInst} arrives`

  return (
    <SMSFormComponent
      errorMessage={errorMessage}
      renderButton={renderButton}
      loading={loading}
      otp={code}
      resentCode={resentCode}
      styles={styles}
      NumInputs={NumInputs}
      handleSubmit={handleSubmit}
      handleChange={handleChange}
      handleRetry={handleRetry}
      mainText={mainText}
      waitText={waitText}
      aside={[3]}
    />
  )
}

VerifyEditCode.navigationOptions = {
  title: 'Edit Profile',
}

const getStylesFromProps = ({ theme }) => ({
  informativeParagraph: {
    margin: '1em',
  },
  buttonWrapper: {
    alignContent: 'stretch',
    flexDirection: 'column',
    display: 'flex',
    justifyContent: 'space-between',
  },
  button: {
    justifyContent: 'center',
    width: '100%',
    height: 60,
  },
  row: {
    marginVertical: theme.sizes.defaultDouble,
  },
  errorStyle: {
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.red,
    color: theme.colors.red,
  },
  container: {
    minHeight: getDesignRelativeHeight(200),
    height: getDesignRelativeHeight(200),
  },
  bottomContent: {
    marginTop: 'auto',
    marginBottom: theme.sizes.defaultDouble,
  },
})

export default withStyles(getStylesFromProps)(VerifyEditCode)
