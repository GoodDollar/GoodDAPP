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

import { 
  useConnectWallet,
  useSetChain,
  useWallets
} from '@web3-onboard/react'

export type ActiveOnboard<T= any> = Omit<Web3ReactContextInterface<Web3Provider>, 'activate' | 'deactivate' | 'setError' | 'connector'>


export interface ActiveOnboardInterface<T = any> extends ActiveOnboard<Web3Provider> {
  active: boolean,
  accounts?: Account[],
  eipProvider?: EIP1193Provider,
  chainId?: ChainId,
  chainIdHex?: string,
  account?: string,
  label?: string,
}

export function onboardContext(wstate: WalletState[]) {
  const [{ provider, label, accounts, chains }] = wstate
  const web3provider = new Web3Provider(provider)
  const chainIdHex = chains[0].id
  const chainId = ONBOARD_CHAINID[chainIdHex]
  const newContext = {
    active: true,
    accounts: accounts,
    eipProvider: provider,
    chainId: chainId,
    chainIdHex: chainIdHex,
    account: web3Utils.toChecksumAddress(accounts[0].address),
    label: label, 
    library: web3provider
  }
  return newContext
}
 
/** 
 * @dev_notice useWallets sometimes returns an empty WalletState while a active connecting does exist
 * so here we check for bot WalletState and AppState for any active connection
 * reason: unknown
 */
export function useActiveOnboard<T = any>():ActiveOnboardInterface<T> {
  const [context, setContext] = useState<ActiveOnboardInterface<Web3Provider>>({active: false})
  const connectedWallets = useWallets()
  console.log({connectedWallets})
  useEffect(() => {
    if (connectedWallets.length > 0) {      
      const newContext = onboardContext(connectedWallets)
      console.log({newContext})
      setContext(newContext)
    } else {
      setContext({active: false})
    }
  }, [connectedWallets])

  return context
}

export function useOnboardConnect() {
  const [tried, setTried] = useState<boolean>(false)
  const [activated, setActivated] = useState<boolean>(false)
  const [{ wallet, connecting}, connect, disconnect] = useConnectWallet()

  useEffect(() => {
    const previouslyConnected:any = JSON.parse(
      localStorage.getItem('connectedWallets') ?? '{}'
    )
    if (connecting || !previouslyConnected[0]) setTried(true)
    if (previouslyConnected[0] && !tried){
      // disableModals:false for silently connecting
      const selectActive =  connect({ autoSelect: { label: previouslyConnected[0].label[0], disableModals: true}}).then(() => {
        setActivated(true)
        setTried(true)
        OnboardSubscribe()
      }) 
    }
  }, [tried, connect, connecting])

  return {tried, activated}
}
