import { EIP1193Provider } from '@web3-onboard/common'
import React, {
  useState,
  useEffect,
} from 'react'
import { Web3Provider } from '@ethersproject/providers'
import { ChainId } from '@sushiswap/sdk'
import { ONBOARD_CHAINID } from 'sdk/constants/chains'
import { WalletState } from '@web3-onboard/core'
import type { Account } from '@web3-onboard/core/dist/types'
import { Web3ReactContextInterface } from '@web3-react/core/dist/types'
import web3Utils from 'web3-utils'
import { OnboardSubscribe } from 'components/BlockNativeOnboard'
import { SupportedChainId } from 'sdk/constants/chains'
import { UnsupportedChainId } from 'sdk/utils/errors'

import { 
  useConnectWallet,
  useSetChain,
  useWallets
} from '@web3-onboard/react'

export type ActiveOnboard<T= any> = Omit<Web3ReactContextInterface<Web3Provider>, 'activate' | 'deactivate' | 'setError' | 'connector'>

export interface EIP1193ProviderExtended extends EIP1193Provider {
  providers?: any
  isMetamask?: boolean,
  selectedProvider: {
    isMetaMask?: boolean, 
    on?: (...args: any[]) => void,
    off?: (...args: any[]) => void,
    removeListener?: (...args: any[]) => void,
    removeAllListeners?: (...args: any[]) => void,
    autoRefreshOnNetworkChange?: boolean,
    request?: (args: {
      method: string;
      params?: unknown[] | object;
  }) => Promise<unknown>,
  } | null
}

export interface ActiveOnboardInterface<T = any> extends ActiveOnboard<Web3Provider> {
  active: boolean,
  accounts?: Account[],
  eipProvider?: EIP1193ProviderExtended,
  chainId?: ChainId,
  chainIdHex?: string,
  account?: string,
  label?: string,
  error?: Error | undefined
}

export function onboardContext(wstate: WalletState[]):ActiveOnboardInterface {
  const [{ provider, label, accounts, chains }] = wstate
  const web3provider = new Web3Provider(provider)
  const chainIdHex = chains[0].id
  const chainId = ONBOARD_CHAINID[chainIdHex] 
  const isSupported = Object.values(SupportedChainId).includes(chainId)
  const error = !isSupported ? new UnsupportedChainId(chainId) : undefined
  const newContext = {
    active: true,
    accounts: accounts,
    chainId: chainId,
    chainIdHex: chainIdHex,
    account: web3Utils.toChecksumAddress(accounts[0].address),
    label: label,
    eipProvider: provider as EIP1193ProviderExtended, 
    library: web3provider,
    error: error

  }
  return newContext
}

export function useActiveOnboard<T = any>():ActiveOnboardInterface<T> {
  const [context, setContext] = useState<ActiveOnboardInterface<Web3Provider>>({active: false})
  const connectedWallets = useWallets()
  useEffect(() => {
    if (connectedWallets.length > 0) {      
      const newContext = onboardContext(connectedWallets)
      setContext(newContext)
    } else {
      setContext({active: false, chainId: 1}) // return chainId 1, because of default web3 provider which uses DAO.MAINNET
    }
  }, [connectedWallets])

  return context
}

interface OnboardConnectProps {
  activated: boolean,
  tried: boolean
}

export function useOnboardConnect():OnboardConnectProps {
  const [tried, setTried] = useState<boolean>(false)
  const [activated, setActivated] = useState<boolean>(false)
  const [{ wallet, connecting}, connect, disconnect] = useConnectWallet()
  const [ {chains, connectedChain, settingChain }, setChain] = useSetChain()

  const previouslyConnected:any = JSON.parse(
    localStorage.getItem('connectedWallets') ?? '{}'
  )

  useEffect(() =>{
    if (wallet && !activated && !connectedChain) {
      let chainIdHex:any
      if (previouslyConnected[0]){
        chainIdHex = previouslyConnected[0].chains.id
      } else {
        chainIdHex = wallet.chains[0].id
      }
      const chainId = ONBOARD_CHAINID[chainIdHex]
      const isSupported = Object.values(SupportedChainId).includes(chainId)
      setChain({chainId: (isSupported ? chainIdHex : "0x1")})
      OnboardSubscribe()
      setActivated(true)
      setTried(true)
    }
  }, [wallet])

  useEffect(() => {
    async function connectOnboard() {
      if (tried || activated) return
      if (activated || !previouslyConnected[0]) {
        setTried(true)
        return
      }

      if (previouslyConnected[0] && !tried){

        // Coinbase reloads before accounts changed is triggered, so empty storage if no active address can be found
        if (previouslyConnected[0].label[0] === 'Coinbase'){ 
          const isStillActive = localStorage.getItem('-walletlink:https://www.walletlink.org:Addresses')
          if (!isStillActive){
            localStorage.removeItem('connectedWallets')
            setTried(true)
            return
          }
        }

        // disableModals:true for silently connecting
        connect({ autoSelect: { label: previouslyConnected[0].label[0], disableModals: true}})
      }
    }
    connectOnboard()
  }, [activated, tried, connect]) 

  return {tried, activated}
}
