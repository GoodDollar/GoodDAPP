import React, { useCallback, useEffect, useState } from 'react'
import { init, useConnectWallet } from '@web3-onboard/react'
import Web3 from 'web3'
import injectedModule from '@web3-onboard/injected-wallets'
import { Platform, View } from 'react-native'
import { get, set } from 'lodash'
import { t } from '@lingui/macro'
import { useDialog } from '../../lib/dialog/useDialog'
import SpinnerCheckMark from '../../components/common/animations/SpinnerCheckMark/SpinnerCheckMark'
import usePromise from '../../lib/hooks/usePromise'
import logger from '../../lib/logger/js-logger'

const injected = injectedModule()
const log = logger.child({ from: 'OnboardWallet' })

init({
  wallets: [injected],
  chains: [
    {
      id: '0x7a',
      token: 'FUSE',
      label: 'Fuse Mainnet',
      rpcUrl: 'https://rpc.fuse.io/',
    },
  ],
})

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

export const useOnboard = () => {
  const [web3, setWeb3] = useState()
  const [
    {
      wallet, // the wallet that has been connected or null if not yet connected
      connecting, // boolean indicating if connection is in progress
    },
    connect, // function to call to initiate user to connect wallet
    disconnect, // function to call to with wallet<DisconnectOptions> to disconnect wallet
    // updateBalances, // function to be called with an optional array of wallet addresses connected through Onboard to update balance or empty/no params to update all connected wallets
    // setWalletModules, // function to be called with an array of wallet modules to conditionally allow connection of wallet types i.e. setWalletModules([ledger, trezor, injected])
  ] = useConnectWallet()

  const [providerPromise, resolveProvider] = usePromise()
  const { showDialog, hideDialog } = useDialog()

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
  const onboardConnect = useCallback(() => {
    connect()
    return providerPromise
  }, [providerPromise, connect])

  useEffect(() => {
    if (wallet) {
      const web3 = new Web3(wallet.provider)
      wrapModalProxy(web3)
      log.debug({ web3, wallet })
      if (!web3.eth.defaultAccount) {
        web3.eth.defaultAccount = wallet.accounts[0].address
      }
      resolveProvider(web3)
      setWeb3(web3)
    }
  }, [wallet, resolveProvider, setWeb3])
  return { onboardConnect, disconnect, connecting, wallet, web3 }
}
