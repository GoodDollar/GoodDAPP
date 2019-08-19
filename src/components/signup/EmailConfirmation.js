// @flow
import React, { useEffect, useState } from 'react'
import API from '../../lib/API/api'
import logger from '../../lib/logger/pino-logger'
import { withStyles } from '../../lib/styles'
import Section from '../common/layout/Section'
import Wrapper from '../common/layout/Wrapper'
import CustomWrapper from './signUpWrapper'

type Props = {
  screenProps: any,
  navigation: any,
}

const log = logger.child({ from: 'EmailConfirmation' })

const EmailConfirmation = ({ navigation, screenProps, styles }: Props) => {
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
    <CustomWrapper
      handleSubmit={handleSubmit}
      footerComponent={props => (
        <Section.Row justifyContent="center" grow>
          <Section.Text fontWeight="medium" fontSize={14} color="primary" onPress={handleResend}>
            {`I haven't received an email`}
          </Section.Text>
        </Section.Row>
      )}
    >
      <Section grow justifyContent="space-between" style={styles.row}>
        <Section grow>
          <Section.Row justifyContent="center">
            <Section.Text fontWeight="medium">{`We've sent an email to:`}</Section.Text>
          </Section.Row>
          <Section.Row justifyContent="center">
            <Section.Text fontFamily="slab" fontSize={22}>
              {globalProfile.email || screenProps.data.email}
            </Section.Text>
          </Section.Row>
        </Section>
        <Wrapper style={styles.containerPadding}>
          <Section.Row justifyContent="center" grow>
            <Section.Text fontFamily="slab" fontSize={22} color="surface">
              {`In order to continue,\ngo to your e-mail app and confirm registration`}
            </Section.Text>
          </Section.Row>
        </Wrapper>
      </Section>
    </CustomWrapper>
  )
}

const getStylesFromProps = ({ theme }) => ({
  containerPadding: {
    paddingTop: 28,
    paddingBottom: 28,
    paddingLeft: 28,
    paddingRight: 28,
    alignItems: 'center',
  },
  row: {
    marginVertical: theme.sizes.defaultDouble,
    paddingHorizontal: 0,
  },
})

export default withStyles(getStylesFromProps)(EmailConfirmation)
