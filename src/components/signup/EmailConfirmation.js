// @flow
import React, { useEffect, useState } from 'react'
import { StyleSheet } from 'react-native'
import { normalize } from 'react-native-elements'

import { useWrappedApi } from '../../lib/API/useWrappedApi'
import { useWrappedUserStorage } from '../../lib/gundb/useWrappedStorage'
import logger from '../../lib/logger/pino-logger'
import GDStore from '../../lib/undux/GDStore'
import LoadingIndicator, { setLoadingWithStore } from '../common/LoadingIndicator'
import { Description, LinkButton, NextButton, Title, Wrapper } from './components'

type Props = {
  screenProps: any,
  navigation: any
}

const log = logger.child({ from: 'EmailConfirmation' })

const EmailConfirmation = ({ navigation, screenProps }: Props) => {
  const [globalProfile, setGlobalProfile] = useState({})
  const API = useWrappedApi()
  const userStorage = useWrappedUserStorage()
  const setLoading = setLoadingWithStore(GDStore.useStore())

  useEffect(() => {
    const { params } = navigation.state

    const validateEmail = async () => {
      setLoading(true)

      const profile = await userStorage.getProfile()
      setGlobalProfile(profile)

      await API.verifyEmail({ code: params.validation })

      screenProps.doneCallback({ ...profile, isEmailConfirmed: true })
    }

    if (params && params.validation) {
      validateEmail()
        .then(() => setLoading(false))
        .catch(() => setLoading(false))
    }
  }, [])

  const handleResend = async () => {
    setLoading(true)

    const profile = globalProfile.email ? globalProfile : screenProps.data
    await API.sendVerificationEmail(profile)

    setLoading(false)
  }

  const handleSubmit = () => {
    log.info('opening email client...')
  }

  return (
    <>
      <Wrapper
        handleSubmit={handleSubmit}
        footerComponent={props => (
          <React.Fragment>
            <Description style={styles.description}>{'Please click the link to approve the email'}</Description>
            <NextButton valid={true} handleSubmit={props.handleSubmit}>
              Open your email app
            </NextButton>
            <LinkButton onPress={handleResend}>Send mail again</LinkButton>
          </React.Fragment>
        )}
      >
        <Description>{"We've sent an email to:"}</Description>
        <Title>{globalProfile.email || screenProps.data.email}</Title>
      </Wrapper>
      <LoadingIndicator />
    </>
  )
}

const styles = StyleSheet.create({
  description: {
    marginBottom: normalize(20)
  }
})

export default EmailConfirmation
