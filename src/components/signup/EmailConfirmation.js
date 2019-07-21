// @flow
import React, { useEffect, useState } from 'react'
import { StyleSheet } from 'react-native'
import normalize from '../../lib/utils/normalizeText'
import API from '../../lib/API/api'

// import { useWrappedUserStorage } from '../../lib/gundb/useWrappedStorage'
import logger from '../../lib/logger/pino-logger'
import { Description, LinkButton, Title, Wrapper } from './components'

type Props = {
  screenProps: any,
  navigation: any,
}

const log = logger.child({ from: 'EmailConfirmation' })

const EmailConfirmation = ({ navigation, screenProps }: Props) => {
  const [globalProfile, setGlobalProfile] = useState({})

  // const API = useWrappedApi()
  // const userStorage = useWrappedUserStorage()
  const setLoading = () => log.warn('implement me')
  useEffect(() => {
    const { params } = navigation.state

    const validateEmail = async () => {
      setLoading(true)

      // recover user's profile persisted to userStorage in SignupState after sending the email
      // done before verifying email to have all the user's information available to display
      const profile = {} //await userStorage.getProfile()
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
  }

  return (
    <>
      <Wrapper
        handleSubmit={handleSubmit}
        footerComponent={props => (
          <React.Fragment>
            <Description style={styles.description}>{'Please approve the email in order to continue'}</Description>
            <LinkButton onPress={handleResend} styles={styles.link}>{`I haven't received an email`}</LinkButton>
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
    marginBottom: normalize(20),
    fontSize: normalize(24),
  },
  link: {
    fontSize: normalize(15),
    opacity: '0.6',
  },
})

export default EmailConfirmation
