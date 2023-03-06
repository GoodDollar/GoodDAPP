// @flow
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { get } from 'lodash'
import { t } from '@lingui/macro'
import logger from '../../lib/logger/js-logger'
import { useUserStorage } from '../../lib/wallet/GoodWalletProvider'
import { useDialog } from '../../lib/dialog/useDialog'
import EmailConfirmation from '../signup/EmailConfirmation'
import SmsForm from '../signup/SmsForm'
import Recaptcha from '../auth/components/Recaptcha'

const log = logger.child({ from: 'Verify Edit Code' })

const VerifyEditCode = props => {
  const userStorage = useUserStorage()
  const { showErrorDialog } = useDialog()
  const [isValidRecaptcha, setValidRecaptcha] = useState(false)
  const { navigation, screenProps } = props
  const { pop, navigateTo } = screenProps
  const field = get(navigation, 'state.params.field')
  const content = get(navigation, 'state.params.content')
  let fieldToSave
  let retryFunctionName
  let RenderComponent

  switch (field) {
    case 'phone':
      fieldToSave = 'mobile'
      retryFunctionName = 'sendOTP'
      RenderComponent = SmsForm
      break

    case 'email':
    default:
      fieldToSave = 'email'
      retryFunctionName = 'sendVerificationEmail'
      RenderComponent = EmailConfirmation
      break
  }

  log.info('Received params', {
    field,
    content,
  })

  const reCaptchaRef = useRef()

  const onRecaptchaSuccess = useCallback(() => {
    log.debug('Recaptcha successfull')
    setValidRecaptcha(true)
  }, [])

  const launchCaptcha = useCallback(() => {
    const { current: captcha } = reCaptchaRef

    log.debug('recaptcha launch', { captcha })
    if (!captcha) {
      return
    }

    // If recaptcha has already been passed successfully, trigger torus right away
    if (captcha.hasPassedCheck()) {
      onRecaptchaSuccess()
      return
    }
    log.debug('recaptcha launch, launching...', { captcha })

    captcha.launchCheck()
  }, [onRecaptchaSuccess])

  const onRecaptchaFailed = useCallback(() => {
    log.debug('Recaptcha failed')
    showErrorDialog('', '', {
      title: t`CAPTCHA test failed`,
      message: t`Please try again.`,
      onDismiss: () => launchCaptcha(),
    })
  }, [launchCaptcha, showErrorDialog])

  const handleSubmit = useCallback(async () => {
    const privacy = await userStorage.getFieldPrivacy(fieldToSave)
    await userStorage.setProfileField(fieldToSave, content, privacy)

    navigateTo('Profile')
  }, [fieldToSave, content, navigateTo, pop, userStorage])

  useEffect(() => {
    if (field === 'phone' && !isValidRecaptcha) {
      launchCaptcha()
    }
  }, [reCaptchaRef.current, isValidRecaptcha])

  return (
    <Recaptcha ref={reCaptchaRef} onSuccess={onRecaptchaSuccess} onFailure={onRecaptchaFailed}>
      {isValidRecaptcha && (
        <RenderComponent
          screenProps={{
            retryFunctionName: retryFunctionName,
            doneCallback: handleSubmit,
            data: {
              [fieldToSave]: content,
            },
          }}
        />
      )}
    </Recaptcha>
  )
}

VerifyEditCode.navigationOptions = {
  title: 'Edit Profile',
}

export default VerifyEditCode
