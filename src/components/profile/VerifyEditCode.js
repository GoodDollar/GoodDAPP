// @flow
import React, { useCallback } from 'react'
import { get } from 'lodash'
import logger from '../../lib/logger/js-logger'
import { useUserStorage } from '../../lib/wallet/GoodWalletProvider'
import EmailConfirmation from '../signup/EmailConfirmation'
import SmsForm from '../signup/SmsForm'
import useRecaptcha from '../auth/components/Recaptcha/useRecaptcha'

const log = logger.child({ from: 'Verify Edit Code' })

const VerifyEditCode = props => {
  const userStorage = useUserStorage()
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

  const { isValidRecaptcha, Captcha } = useRecaptcha({ enabled: field !== 'phone' })

  const handleSubmit = useCallback(async () => {
    const privacy = await userStorage.getFieldPrivacy(fieldToSave)
    await userStorage.setProfileField(fieldToSave, content, privacy)

    navigateTo('Profile')
  }, [fieldToSave, content, navigateTo, pop, userStorage])

  return (
    <Captcha>
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
    </Captcha>
  )
}

VerifyEditCode.navigationOptions = {
  title: 'Edit Profile',
}

export default VerifyEditCode
