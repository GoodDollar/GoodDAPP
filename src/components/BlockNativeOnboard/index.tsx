import { useWeb3React } from '@web3-react/core'
import React, {
  useCallback, useEffect,
} from 'react'
import { onboard } from '../../connectors'
import { WalletState } from '@web3-onboard/core'
import { useConnectWallet, useWallets, useSetChain } from '@web3-onboard/react'


/**
 * @dev_notice docs state onboard.disconnectWallet to clear up / all state is emptied before it can be used?
 * @param wallets 
 * @param sub 
 * @returns 
 */
export function StoreOnboardState(wallets:WalletState[], sub?:any):void {
  // const [primaryWallet] = onboard.state.get().wallets // is emptied on disconnect before it can be used
  console.log('wallets -->', wallets)

  if (wallets.length === 0){
    localStorage.removeItem('connectedWallets')
    sub.unsubscribe()
    return
  } else {
    const walletLabel = wallets.map(({ label }) => label)
    const connectedAccount = wallets.map(({accounts}) => accounts[0]) // filter or find?    
    const connected = [{
      accounts: connectedAccount,
      label: walletLabel}
    ]
  
    localStorage.setItem(
      'connectedWallets',
      JSON.stringify(connected)
    )
  }
}

export function OnboardSubscribe():void {
  const activeOnboard = onboard.state.select('wallets')
  const sub = activeOnboard.subscribe(wallets => {
    console.log('state update -->', wallets)
    StoreOnboardState(wallets, sub)
  })
}


export function BlockNativeStatus():JSX.Element {
  const [{wallet, connecting}, connect, disconnect] = useConnectWallet()
  const connectedWallets = useWallets()
  useEffect(() => {
    if (connecting) {
      console.log('connecting wallet . . . ')
      // loader
    } 

    if (wallet || connectedWallets.length > 0) {
      // StoreOnboardState(connectedWallets) 
      OnboardSubscribe()
    }
  }, [wallet, connecting, connectedWallets])

  return (
    <button onClick={() => connect({})}>Connect Wallet V2</button>
  )
}
