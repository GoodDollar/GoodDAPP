// @flow
import React, { useEffect, useState } from 'react'
import normalize from '../../lib/utils/normalizeText'
import API from '../../lib/API/api'
import logger from '../../lib/logger/pino-logger'
import { withStyles } from '../../lib/styles'
import Section from '../common/layout/Section'
import Wrapper from '../common/layout/Wrapper'
import CustomWrapper from './signUpWrapper'
import InputText from '../common/form/InputText'

type Props = {
  screenProps: any,
  navigation: any,
}

const log = logger.child({ from: 'EmailConfirmation' })

const EmailConfirmation = ({ navigation, screenProps, styles }: Props) => {
  
  const [globalProfile, setGlobalProfile] = useState({});
  const [code, setCode] = useState('');
  const [errorMessage, setErrorMessage] = useState();

  // const API = useWrappedApi()
  // const userStorage = useWrappedUserStorage()
  const setLoading = () => log.warn('implement me')
  
  const validateEmail = async (code) => {
    setLoading(true)
  
    // recover user's profile persisted to userStorage in SignupState after sending the email
    // done before verifying email to have all the user's information available to display
    const profile = {} //await userStorage.getProfile()
    setGlobalProfile(profile)
    
    const res = await API.verifyEmail({ code: Number(code)})
   
    if (!res.data.ok) {
      setErrorMessage("Oops, it's not right code")
    } else {
      screenProps.doneCallback({ ...profile, isEmailConfirmed: true })
    }
    setLoading(false)
  }
  
  const handleResend = async () => {
    setLoading(true)

    const profile = globalProfile.email ? globalProfile : screenProps.data
    await API.sendVerificationEmail(profile)

    setLoading(false)
  }

  const handleSubmit = () => {
    if (code) (
      validateEmail(code)
    )
    
  }
  
  const handleChange = (code: string) => {
    setErrorMessage()
    if (code) {
      if (code.length <= 10 ) {
        setCode(code.replace(/[^0-9]/g, ''))
      }
    } else {
      setCode('')
    }
  }

  const handleEnter = (event: { nativeEvent: { key: string } }) => {
    if (event.nativeEvent.key === 'Enter') {
      handleSubmit()
    }
  }
  
  return (
    <CustomWrapper
      handleSubmit={handleSubmit}
      footerComponent={props => (
        <Section.Row justifyContent="center" grow>
          <Section.Text fontFamily="medium" fontSize={14} color="primary" onPress={handleResend}>
            {`I haven't received an email`}
          </Section.Text>
        </Section.Row>
      )}
    >
      <Section grow justifyContent="space-between" style={styles.row}>
        <Section grow>
          <Section.Row justifyContent="center">
            <Section.Text fontFamily="medium" fontSize={16} color="darkGray">
              {`We've sent an email to:`}
            </Section.Text>
          </Section.Row>
          <Section.Row justifyContent="center">
            <Section.Text fontFamily="slab" fontSize={22} color="darkGray">
              {globalProfile.email || screenProps.data.email}
            </Section.Text>
          </Section.Row>
          <Section.Row justifyContent="center">
              <InputText
                id={'code_input'}
                value={code}
                onChangeText={handleChange}
                error={errorMessage}
                onKeyPress={handleEnter}
                onCleanUpField={handleChange}
                autoFocus
              />
          </Section.Row>
        </Section>
        <Wrapper style={styles.containerPadding}>
          <Section.Row justifyContent="center" grow>
            <Section.Text fontFamily="slab" fontSize={22} color="surface">
              {`In order to continue, \n go to your e-mail app and confirm registration`}
            </Section.Text>
          </Section.Row>
        </Wrapper>
      </Section>
    </CustomWrapper>
  )
}

const getStylesFromProps = ({ theme }) => ({
  containerPadding: {
    padding: normalize(28),
    alignItems: 'center',
  },
  row: {
    marginVertical: theme.sizes.defaultDouble,
    paddingHorizontal: 0,
  },
})

export default withStyles(getStylesFromProps)(EmailConfirmation)
