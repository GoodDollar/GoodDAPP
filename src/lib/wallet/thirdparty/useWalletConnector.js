import React, { useCallback, useEffect, useRef, useState } from 'react'
import Web3 from 'web3'

import { Platform, View } from 'react-native'
import { get, set } from 'lodash'
import { t } from '@lingui/macro'
import AsyncStorage from '../../utils/asyncStorage'
import { GD_WEB3WALLET } from '../../constants/localStorage'
import { useDialog } from '../../dialog/useDialog'
import SpinnerCheckMark from '../../../components/common/animations/SpinnerCheckMark/SpinnerCheckMark'
import logger from '../../logger/js-logger'
import { useConnector } from './useConnector'
import { chains } from './ThirdPartyWalletProvider'
const log = logger.child({ from: 'WalletConnector' })

const LoadingAnimation = ({ success, speed = 3 }) => (
  <View style={{ alignItems: 'center' }}>
    <SpinnerCheckMark
      successSpeed={speed}
      success={success}
      width={145}
      marginTop={Platform.select({ web: undefined, default: 5 })}
    />
  </View>
)

export const useWalletConnector = () => {
  const [web3, setWeb3] = useState(false)
  const curProvider = useRef()
  const [resolveProvider, setResolveProvider] = useState()
  const { showDialog, hideDialog } = useDialog()

  const {
    setChain,
    isValidChain,
    connectedChain,
    connect,
    connecting,
    provider,
    disconnect,
    accounts,
    walletName,
  } = useConnector()

  const wrapModalProxy = web3 => {
    ;['eth.personal.sign', 'eth.send', 'eth.sendTransaction'].forEach(methodPath => {
      const old = get(web3, methodPath)
      set(web3, methodPath, async (...args) => {
        try {
          showDialog({
            image: <LoadingAnimation />,
            buttons: [],
            title: t`Please sign with your wallet...`,
            showCloseButtons: false,
          })
          const res = await old(...args)
          return res
        } finally {
          hideDialog()
        }
      })
    })
  }
  const walletConnect = useCallback(async () => {
    const lastWalletLabel = await AsyncStorage.getItem(GD_WEB3WALLET)
    log.debug({ lastWalletLabel })
    connect(lastWalletLabel ? { autoSelect: { label: lastWalletLabel, disableModals: true } } : undefined)
    const providerPromise = new Promise((res, rej) => {
      setResolveProvider({ res, rej })
    })
    return providerPromise
  }, [setResolveProvider, connect, web3])

  useEffect(() => {
    if (!provider && !connecting && resolveProvider) {
      resolveProvider.rej(new Error('user closed wallets modal'))
    }
  }, [connecting, provider, resolveProvider])

  useEffect(() => {
    log.debug('create wallet effect', { provider, isValidChain, curProvider, resolveProvider })

    if (!provider && curProvider.current) {
      curProvider.current = undefined
      return setWeb3(undefined)
    }

    if (provider && !isValidChain) {
      return
    }

    if (provider && web3 && provider === curProvider.current && !connecting) {
      resolveProvider && resolveProvider.res(web3)
    }

    if (provider && provider !== curProvider.current) {
      log.debug('create wallet effect creating new wallet:', { provider, isValidChain, curProvider, resolveProvider })

      const web3 = new Web3(provider)
      wrapModalProxy(web3)

      if (!web3.eth.defaultAccount) {
        web3.eth.defaultAccount = accounts?.[0]
      }

      curProvider.current = provider
      AsyncStorage.setItem(GD_WEB3WALLET, walletName)
      resolveProvider && resolveProvider.res(web3)
      setWeb3(web3)
    } else if (!provider && !resolveProvider) {
      setWeb3(undefined) // mark that we initialized
    }
  }, [provider, isValidChain, curProvider, resolveProvider, web3, setWeb3, connecting, walletName])

  useEffect(() => {
    log.debug('chain changed', { provider, connectedChain })

    if (!provider) {
      return
    }

    if (!isValidChain) {
      setChain({ chainId: '0x7a' })
      showDialog({
        buttons: [],
        title: t`Please switch to supported chain`,
        message: t`Supported networks: ${chains.map(_ => _.label).join(', ')}`,
        showCloseButtons: false,
        loading: true,
      })
    }

    return hideDialog
  }, [connectedChain, isValidChain, setChain, provider])
  return { walletConnect, disconnect, connecting, provider, web3 }
}
