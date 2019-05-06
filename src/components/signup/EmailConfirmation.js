// @flow
import React, { useEffect, useState } from 'react'
import { StyleSheet } from 'react-native'
import normalize from 'react-native-elements/src/helpers/normalizeText'
import { useWrappedApi } from '../../lib/API/useWrappedApi'
import { useWrappedUserStorage } from '../../lib/gundb/useWrappedStorage'
import logger from '../../lib/logger/pino-logger'
import GDStore from '../../lib/undux/GDStore'
import { setLoadingWithStore } from '../common/LoadingIndicator'
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

      // recover user's profile persisted to userStorage in SignupState after sending the email
      // done before verifying email to have all the user's information available to display
      const profile = await userStorage.getProfile()
      setGlobalProfile(profile)

      await API.verifyEmail({ code: params.validation })

      screenProps.doneCallback({ ...profile, isEmailConfirmed: true })
    }

    if (params && params.validation) {
      validateEmail().finally(() => setLoading(false))
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
    // This link will continue working as it was working in dev mode. Clicking 'Open your emial app' button, will
    // continue with registration progress instead of triggering email client.
    // TODO: for production mode, this should just trigger the email client.
    screenProps.doneCallback({ isEmailConfirmed: true })
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
    </>
  )
}

const styles = StyleSheet.create({
  description: {
    marginBottom: normalize(20)
  }
})

export default EmailConfirmation
