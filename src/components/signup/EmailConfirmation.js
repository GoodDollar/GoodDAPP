// @flow
import React, { useEffect, useState } from 'react'
import { StyleSheet } from 'react-native'
import { normalize } from 'react-native-elements'

import { useWrappedApi } from '../../lib/API/useWrappedApi'
import { useWrappedUserStorage } from '../../lib/gundb/useWrappedStorage'
import logger from '../../lib/logger/pino-logger'
import { Description, LinkButton, NextButton, Title, Wrapper } from './components'

type Props = {
  screenProps: any,
  navigation: any
}

const log = logger.child({ from: 'EmailConfirmation' })

const EmailConfirmation = ({ navigation, screenProps }: Props) => {
  const [processing, setProcessing] = useState(false)
  const API = useWrappedApi()
  const userStorage = useWrappedUserStorage()

  useEffect(() => {
    const { params } = navigation.state

    const validateEmail = async () => {
      setProcessing(true)
      const globalProfile = await userStorage.getProfile()
      await API.verifyEmail({ code: params.validation })

      screenProps.doneCallback({ ...globalProfile, isEmailConfirmed: true })
    }

    if (params && params.validation) {
      validateEmail().then(() => setProcessing(false))
    }
  }, [])

  const handleResend = async () => {
    setProcessing(true)
    await API.sendVerificationEmail(screenProps.data)
    setProcessing(false)
  }

  const handleSubmit = () => {
    log.info('opening email client...')
  }

  return (
    <Wrapper
      handleSubmit={handleSubmit}
      footerComponent={props => (
        <React.Fragment>
          <Description style={styles.description}>{'Please click the link to approve the email'}</Description>
          <NextButton valid={true} handleSubmit={props.handleSubmit} loading={processing}>
            Open your email app
          </NextButton>
          <LinkButton onPress={() => !processing && handleResend()}>Send mail again</LinkButton>
        </React.Fragment>
      )}
    >
      <Description>{"We've sent an email to:"}</Description>
      <Title>{screenProps.data.email}</Title>
    </Wrapper>
  )
}

const styles = StyleSheet.create({
  description: {
    marginBottom: normalize(20)
  }
})

export default EmailConfirmation
