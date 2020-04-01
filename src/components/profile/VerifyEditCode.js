// @flow
import React from 'react'
import { get } from 'lodash'
import logger from '../../lib/logger/pino-logger'
import { getDesignRelativeHeight } from '../../lib/utils/sizes'
import { withStyles } from '../../lib/styles'
import userStorage from '../../lib/gundb/UserStorage'
import EmailConfirmation from '../signup/EmailConfirmation'
import SmsForm from '../signup/SmsForm'

const log = logger.child({ from: 'Verify Edit Code' })

const VerifyEditCode = props => {
  const { navigation } = props
  const field = get(navigation, 'state.params.field')
  const content = get(navigation, 'state.params.content')
  let fieldToSave
  let retryFunctionName
  let RenderComponent

  switch (field) {
    case 'phone':
      fieldToSave = 'mobile'
      retryFunctionName = 'sendNewOTP'
      RenderComponent = SmsForm
      break

    case 'email':
    default:
      fieldToSave = 'email'
      retryFunctionName = 'sendVerificationForNewEmail'
      RenderComponent = EmailConfirmation
      break
  }

  log.info('Received params', {
    field,
    content,
  })

  const handleSubmit = async () => {
    const privacy = await userStorage.getFieldPrivacy(fieldToSave)
    await userStorage.setProfileField(fieldToSave, content, privacy)

    navigation.navigate('Profile')
  }

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
