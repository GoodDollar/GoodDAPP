// @flow
import React from 'react'
import { StyleSheet } from 'react-native'
import normalize from 'react-native-elements/src/helpers/normalizeText'
import logger from '../../lib/logger/pino-logger'
import { Description, Title, Wrapper } from './components'
import { isMobileSafari } from 'mobile-device-detect'

type Props = {
  screenProps: any,
  navigation: any
}

const log = logger.child({ from: 'EmailConfirmationError' })

const getBrowserData = () => {
  const standalone = window.navigator.standalone,
    userAgent = window.navigator.userAgent.toLowerCase(),
    safari = /safari/.test(userAgent),
    ios = /iphone|ipod|ipad/.test(userAgent)
  return {
    standalone,
    safari,
    ios
  }
}

const BrowserSpecificMessage = () => {
  if (isMobileSafari)
    return <Description>You can open this link in safari using safari icon on the bottom right</Description>
  return null
}

const EmailConfirmationError = ({ navigation, screenProps }: Props) => {
  return (
    <>
      <Wrapper footerComponent={props => null}>
        <Title style={styles.wrapper}>Email Confirmation Fail</Title>
        <Description>
          {
            'In order to be able to continue with the signup process please open this link in the same browser you start the registration process'
          }
        </Description>
        <BrowserSpecificMessage />
      </Wrapper>
    </>
  )
}

const styles = StyleSheet.create({
  wrapper: {
    marginTop: normalize(50)
  },
  description: {
    marginBottom: normalize(20),
    fontSize: normalize(24)
  },
  link: {
    fontSize: normalize(15),
    opacity: '0.6'
  }
})

export default EmailConfirmationError
