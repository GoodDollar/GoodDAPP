// @flow
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { Switch, Text, View } from 'react-native'
import { withStyles } from '../../lib/styles'
import AsyncStorage from '../../lib/utils/asyncStorage'
import { GD_CONNECTPROVIDER, GD_CONNECTPROVIDER_STATEHASH } from '../../lib/constants/localStorage'

import { Section, Wrapper } from '../common'
import useCeramicSDK from '../../lib/hooks/useCeramicSDK'
import useTorus from '../../components/auth/torus/hooks/useTorus'
import GoogleBtnIcon from '../../assets/Auth/btn_google.svg'
import FacebookBtnIcon from '../../assets/Auth/btn_facebook.svg'
import MobileBtnIcon from '../../assets/Auth/btn_mobile.svg'
import Recaptcha from '../../components/auth/login/Recaptcha/index'
import { useErrorDialog } from '../../lib/undux/utils/dialog'
import useLoadingIndicator from '../../lib/hooks/useLoadingIndicator'

import logger from '../../lib/logger/js-logger'

const log = logger.child({ from: 'ConnectedAccounts' })

const TITLE = 'Connected Accounts'

const ConnectedAccounts = ({ screenProps, styles }) => {
  const [connectedAccounts, setAccounts] = useState({})
  const [showLoading, hideLoading] = useLoadingIndicator()

  const [ceramicSDK, ceramicInitialized, mainAccount] = useCeramicSDK()
  const [showErrorDialog] = useErrorDialog()
  const [torusSDK, sdkInitialized] = useTorus()
  const providers = Object.values(connectedAccounts)

  const fetchAuthProviders = useCallback(async () => {
    const metaData = await ceramicSDK.getMeta()
    const authenticatorsObject = metaData?.content?.authenticators || {}
    logger.debug('got connected providers', { authenticatorsObject })

    setAccounts(authenticatorsObject)
  }, [ceramicSDK])

  const addAccount = useCallback(
    async torusResult => {
      const provider = await AsyncStorage.getItem(GD_CONNECTPROVIDER)
      AsyncStorage.removeItem(GD_CONNECTPROVIDER)
      try {
        showLoading()
        if (provider) {
          log.debug('found torus login.. fetching result', { provider })
          const statehash = await AsyncStorage.getItem(GD_CONNECTPROVIDER_STATEHASH)
          AsyncStorage.removeItem(GD_CONNECTPROVIDER_STATEHASH)
          let redirectResult = torusResult
          if (statehash) {
            //for the webapp case, on mobile we get the result from triggerLogin
            window.location.hash = statehash
            redirectResult = await torusSDK.getRedirectResult()
          }
          const { privateKey, publicAddress } = redirectResult
          log.debug('got torus result:', { publicAddress })
          await ceramicSDK.addAuthenticator(privateKey, publicAddress, provider)
        }
        await fetchAuthProviders()
      } catch (e) {
        log.error('failed connecting account:', e, e.message)
        showErrorDialog('An error occurred while trying to connect the account.', '')
      } finally {
        hideLoading()
      }
    },
    [fetchAuthProviders, ceramicSDK],
  )

  const onToggle = useCallback(
    async (event, loginProvider) => {
      if (event) {
        AsyncStorage.setItem(GD_CONNECTPROVIDER, loginProvider)
        const torusResult = await torusSDK.triggerLogin(loginProvider)

        //on native mobile we immediatly get the result
        if (torusResult) {
          addAccount(torusResult)
        }
      } else {
        const toRemove = Object.entries(connectedAccounts).find(_ => _[1] === loginProvider)[0]
        if (providers.length > 1 && toRemove !== mainAccount) {
          try {
            showLoading()
            await ceramicSDK.removeAuthenticator(toRemove)
            await fetchAuthProviders()
            hideLoading()
          } catch (e) {
            if (e.message === 'Key set version already exist') {
              showErrorDialog('Accounts can be removed only once a day, try again tomorrow.', '')
            }
          }
        }
      }
    },
    [connectedAccounts, torusSDK, fetchAuthProviders, ceramicSDK, addAccount],
  )

  useEffect(() => {
    if (sdkInitialized && ceramicInitialized) {
      hideLoading()
      log.debug('sdks initialized.. fetching ceramic/torus data')
      addAccount()
    } else {
      showLoading()
    }
  }, [sdkInitialized, ceramicInitialized, addAccount])

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

  const onRecaptchaSuccess = useCallback(() => {
    onToggle(true, 'auth0-pwdless-sms')
  }, [torusSDK, onToggle])

  const IconWithInfo = ({ icon, label, checked, value }) => (
    <View key={label} style={styles.accountView}>
      <View style={styles.accountTextAndIcon}>
        <View style={{ width: 30 }}>{icon}</View>
        <Text>{label}</Text>
      </View>
      {value === 'auth0-pwdless-sms' && !checked ? (
        <Recaptcha ref={reCaptchaRef} onSuccess={onRecaptchaSuccess}>
          <Switch value={checked} onValueChange={_mobile} />
        </Recaptcha>
      ) : (
        <Switch value={checked} onValueChange={e => onToggle(e, value)} />
      )}
    </View>
  )

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
      checked: providers.includes('auth0-pwdless-sms'),
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
