// @flow
import React, { useCallback } from 'react'
import { get } from 'lodash'
import logger from '../../lib/logger/pino-logger'
import userStorage from '../../lib/userStorage/UserStorage'
import EmailConfirmation from '../signup/EmailConfirmation'
import SmsForm from '../signup/SmsForm'

const log = logger.child({ from: 'Verify Edit Code' })

const VerifyEditCode = props => {
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

  const handleSubmit = useCallback(async () => {
    const privacy = await userStorage.getFieldPrivacy(fieldToSave)
    await userStorage.setProfileField(fieldToSave, content, privacy)

    navigateTo('Profile')
  }, [fieldToSave, content, navigateTo, pop])

  return (
    <RenderComponent
      screenProps={{
        retryFunctionName: retryFunctionName,
        doneCallback: handleSubmit,
        data: {
          [fieldToSave]: content,
        },
      }}
    />
  )
}

VerifyEditCode.navigationOptions = {
  title: 'Edit Profile',
}

export default VerifyEditCode
