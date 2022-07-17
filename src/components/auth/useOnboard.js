import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { init, useConnectWallet, useSetChain } from '@web3-onboard/react'
import Web3 from 'web3'
import injectedModule from '@web3-onboard/injected-wallets'

// import walletConnectModule from '@web3-onboard/walletconnect'

import { Platform, View } from 'react-native'
import { get, set } from 'lodash'
import { t } from '@lingui/macro'
import { useDialog } from '../../lib/dialog/useDialog'
import SpinnerCheckMark from '../../components/common/animations/SpinnerCheckMark/SpinnerCheckMark'
import logger from '../../lib/logger/js-logger'

// initialize the module with options
// const walletConnect = walletConnectModule({
//   bridge: 'YOUR_CUSTOM_BRIDGE_SERVER',
//   qrcodeModalOptions: {
//     mobileLinks: ['rainbow', 'metamask', 'argent', 'trust', 'imtoken', 'pillar'],
//   },
// })
const log = logger.child({ from: 'OnboardWallet' })

const injected = injectedModule()

init({
  wallets: [injected],
  chains: [
    {
      id: '0x7a',
      token: 'FUSE',
      label: 'Fuse Mainnet',
      rpcUrl: 'https://rpc.fuse.io/',
      icon: `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="100%" height="100%" viewBox="0 0 74 74"><defs><linearGradient id="a" x1="0.5" x2="0.5" y2="1" gradientUnits="objectBoundingBox"><stop offset="0" stop-color="#b1fdc0"/><stop offset="1" stop-color="#fefd86"/></linearGradient></defs><g transform="translate(-151 -208)"><g transform="translate(57 -154)"><circle cx="37" cy="37" r="37" transform="translate(94 362)" fill="url(#a)"/><path d="M1223.176,815.334a3.936,3.936,0,0,0-2.328-3.629l-4.305-1.963,4.31-1.948a3.981,3.981,0,0,0,.013-7.251l-12.538-5.716a16.977,16.977,0,0,0-14.036-.023l-12.557,5.675a3.981,3.981,0,0,0-.012,7.25l4.3,1.962-4.31,1.948a3.98,3.98,0,0,0-.012,7.25l4.3,1.963L1181.7,822.8a3.981,3.981,0,0,0-.011,7.25l12.538,5.717a16.978,16.978,0,0,0,14.036.023l12.555-5.675a3.981,3.981,0,0,0,.013-7.251l-4.3-1.962,4.311-1.948a3.936,3.936,0,0,0,2.341-3.62m-32.281,7.747,3.345,1.525a16.981,16.981,0,0,0,14.042.024l1.952-.882-4.993-2.275-.168.052a12.944,12.944,0,0,1-9.158-.6l-12.412-5.661,7.409-3.347,3.349,1.528a16.977,16.977,0,0,0,14.035.023l1.951-.883-4.992-2.275-.17.052a12.929,12.929,0,0,1-9.147-.595l-12.416-5.662,12.434-5.62a12.937,12.937,0,0,1,10.693.018l12.415,5.661-12.292,5.557,12.274,5.6-12.288,5.555,12.27,5.606-12.432,5.62a12.939,12.939,0,0,1-10.7-.018l-12.414-5.661Z" transform="translate(-1070.557 -416.498)" fill="#646464"/></g></g></svg>`,
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
  const [web3, setWeb3] = useState(false)
  const [chainInfo, setChain] = useSetChain()
  const curWallet = useRef()
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

  const [resolveProvider, setResolveProvider] = useState()
  const { showDialog, hideDialog } = useDialog()

  const isValidChain = useMemo(
    () => chainInfo?.chains && chainInfo?.chains.find(c => c.id === chainInfo.connectedChain?.id),
    [chainInfo],
  )

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
    const providerPromise = new Promise((res, rej) => {
      setResolveProvider({ res, rej })
    })
    return providerPromise
  }, [setResolveProvider, connect])

  useEffect(() => {
    if (!wallet && !connecting && resolveProvider) {
      resolveProvider.rej(new Error('user closed wallets modal'))
    }
  }, [connecting, wallet, resolveProvider])

  useEffect(() => {
    log.debug('create wallet effect', { wallet, isValidChain, curWallet, resolveProvider })

    if (!wallet && curWallet.current) {
      curWallet.current = undefined
      return setWeb3(undefined)
    }

    if (wallet && !isValidChain) {
      return
    }

    if (wallet && wallet !== curWallet.current) {
      log.debug('create wallet effect creating new wallet:', { wallet, isValidChain, curWallet, resolveProvider })

      const web3 = new Web3(wallet.provider)
      wrapModalProxy(web3)
      if (!web3.eth.defaultAccount) {
        web3.eth.defaultAccount = wallet.accounts[0].address
      }
      curWallet.current = wallet
      resolveProvider && resolveProvider.res(web3)
      setWeb3(web3)
    } else if (!wallet && !resolveProvider) {
      setWeb3(undefined) // mark that we initialized
    }
  }, [wallet, isValidChain, curWallet, resolveProvider, setWeb3])

  useEffect(() => {
    log.debug('chain changed', { wallet, chainInfo })
    if (!wallet) {
      return
    }

    if (!isValidChain) {
      setChain({ chainId: '0x7a' })
      showDialog({
        buttons: [],
        title: t`Please switch to supported chain`,
        message: t`Supported networks: ${chainInfo.chains.map(_ => _.label).join(', ')}`,
        showCloseButtons: false,
        loading: true,
      })
    }

    return hideDialog
  }, [chainInfo.connectedChain, isValidChain, setChain])
  return { onboardConnect, disconnect, connecting, wallet, web3 }
}
