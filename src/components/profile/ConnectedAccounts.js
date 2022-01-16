// @flow
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { Switch, Text, View } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { CeramicSDK } from '@gooddollar/ceramic-seed-sdk'
import Web3 from 'web3'
import { withStyles } from '../../lib/styles'
import { Section, Wrapper } from '../common'

import useTorus from '../../components/auth/torus/hooks/useTorus'
import GoogleBtnIcon from '../../assets/Auth/btn_google.svg'
import FacebookBtnIcon from '../../assets/Auth/btn_facebook.svg'
import MobileBtnIcon from '../../assets/Auth/btn_mobile.svg'
import Recaptcha from '../../components/auth/login/Recaptcha/index'
import { useErrorDialog } from '../../lib/undux/utils/dialog'

const TITLE = 'Connected Accounts'
const sdk = new CeramicSDK('https://ceramic-clay.3boxlabs.com')

const ConnectedAccounts = ({ screenProps, styles }) => {
  const [providers, setProviders] = useState([])
  const [authenticatorData, setAuthenticatorData] = useState({})

  const initializeAccount = useCallback(async () => {
    const privateAccountKey = JSON.parse(localStorage.getItem('GD_masterSeed'))
    const web3 = new Web3()
    const publicAccountKey = web3.eth.accounts.privateKeyToAccount(privateAccountKey)
    await sdk.initialize(privateAccountKey.slice(0, privateAccountKey.length / 2), publicAccountKey.address)
  }, [])
  const [showErrorDialog] = useErrorDialog()

  const fetchAuthProviders = useCallback(async () => {
    await initializeAccount()
    const metaData = await sdk.getMeta()
    const authenticatorsObject = metaData?.state$?.state$?.value?.content?.authenticators || {}
    setProviders(Object.values(authenticatorsObject))
    let objectToSetAuthenticator = Object.entries(authenticatorsObject).reduce(
      // eslint-disable-next-line no-sequences
      (acc, [key, value]) => ((acc[value] = key), acc),
      {},
    )
    setAuthenticatorData(objectToSetAuthenticator)
  }, [initializeAccount])

  const addAuthenticatedUser = useCallback(
    async authProvider => {
      const provider = await AsyncStorage.getItem('connectAccountsProviderLoginInitiated')
      AsyncStorage.removeItem('connectAccountsProviderLoginInitiated')
      if (provider) {
        const redirectResult = await AsyncStorage.getItem('torusRedirectResult')
        AsyncStorage.removeItem('torusRedirectResult')
        if (redirectResult) {
          const parsedResult = JSON.parse(redirectResult)
          const { privateKey, typeOfLogin, publicAddress } = parsedResult
          await initializeAccount()
          await sdk
            .addAuthenticator(privateKey.slice(0, privateKey.length / 2), publicAddress, typeOfLogin)
            .catch(err => {
              showErrorDialog('An error occurred while adding the authentication provider', '')
            })
          fetchAuthProviders()
        }
      }
    },
    [fetchAuthProviders],
  )

  const [torusSDK, sdkInitialized] = useTorus()

  useEffect(() => {
    if (sdkInitialized) {
      addAuthenticatedUser()
    }
  }, [sdkInitialized, addAuthenticatedUser])

  useEffect(() => {
    fetchAuthProviders()
  }, [fetchAuthProviders])
  const reCaptchaRef = useRef()
  const _mobile = () => {
    const { current: captcha } = reCaptchaRef
    if (!captcha) {
      return
    }
    if (captcha.hasPassedCheck()) {
      onRecaptchaSuccess()
      return
    }
    captcha.launchCheck()
  }

  const startLogin = (loginProvider: string) => {
    AsyncStorage.setItem('connectAccountsProviderLoginInitiated', loginProvider)
  }

  const onRecaptchaSuccess = useCallback(() => {
    startLogin('auth0-pwdless-sms')
    torusSDK.triggerLogin('auth0-pwdless-sms')
  }, [torusSDK])

  const IconWithInfo = ({ icon, label, checked, value }) =>
    sdkInitialized ? (
      <View key={label} style={styles.accountView}>
        <View style={styles.accountTextAndIcon}>
          <View style={{ width: 30 }}>{icon}</View>
          <Text>{label}</Text>
        </View>
        {value === 'auth0-pwdless-sms' && !checked ? (
          <Recaptcha ref={reCaptchaRef} onSuccess={onRecaptchaSuccess}>
            <Switch
              value={checked}
              onValueChange={event => {
                _mobile()
              }}
            />
          </Recaptcha>
        ) : (
          <Switch
            value={checked}
            onValueChange={async event => {
              if (event) {
                startLogin(value)
                torusSDK.triggerLogin(value)
              } else {
                if (providers.length !== 0) {
                  await sdk.removeAuthenticator(authenticatorData[value === 'auth0-pwdless-sms' ? 'jwt' : value])
                  fetchAuthProviders()
                }
              }
            }}
          />
        )}
      </View>
    ) : null

  const authOptions = [
    {
      label: 'Facebook Provider',
      icon: <FacebookBtnIcon width="100%" iconprops={{ viewBox: '0 0 11 22' }} />,
      checked: providers.includes('facebook'),
      value: 'facebook',
    },
    {
      label: 'Google Provider',
      icon: (
        <View style={{ marginLeft: -12.5 }}>
          <GoogleBtnIcon width="100%" height="24" iconprops={{ viewBox: '0 0 11 24' }} />
        </View>
      ),
      checked: providers.includes('google'),
      value: 'google',
    },
    {
      label: 'Phone Provider',
      icon: <MobileBtnIcon width="100%" iconprops={{ viewBox: '0 0 11 22' }} />,
      checked: providers.includes('jwt'),
      value: 'auth0-pwdless-sms',
    },
  ]
  return (
    <Wrapper>
      <Section style={styles.section}>
        <View>{authOptions.map(data => IconWithInfo(data))}</View>
      </Section>
    </Wrapper>
  )
}

ConnectedAccounts.navigationOptions = {
  title: TITLE,
  customBackScreen: 'Dashboard',
}

const getStylesFromProps = ({ theme }) => {
  return {
    section: {
      flexGrow: 1,
      padding: theme.sizes.defaultDouble,
    },
    accountView: {
      flexDirection: 'row',
      padding: 10,
      alignItems: 'center',
      justifyContent: 'space-between',
      marginVertical: 2.5,
    },
    accountTextAndIcon: {
      flexDirection: 'row',
      alignItems: 'center',
      width: 160,
      marginLeft: 10,
    },
  }
}

export default withStyles(getStylesFromProps)(ConnectedAccounts)
