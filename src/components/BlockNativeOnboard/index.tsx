import React, {
  useEffect
} from 'react'
import styled from 'styled-components'
import { onboard } from '../../connectors'
import { WalletState } from '@web3-onboard/core'
import { useConnectWallet, useWallets, useSetChain } from '@web3-onboard/react'

const BlockNativeButton = styled.button`
  ${({ theme }) => theme.flexRowNoWrap}
  background-color: ${({ theme }) => theme.color.text2};
  border: none;
  border-radius: 6px;

  font-style: normal;
  font-weight: 500;
  font-size: 16px;
  line-height: 19px;
  color: ${({ theme }) => theme.color.main};
  padding-left: 17px;
  padding-right: 17px;
  padding-top: 10px;
  height: 42px;
  transition: background 0.25s;

  &:hover,
  &:focus {
      border: none;
      background-color: ${({ theme }) => theme.color.text2hover};
      transition: background 0.25s;
  }
`

/**
 * @dev_notice docs state onboard.disconnectWallet to clear up / all state is emptied before it can be used?
 * @param wallets 
 * @param sub 
 * @returns 
 */
export function StoreOnboardState(wallets:WalletState[], sub?:any):void {
  if (wallets.length === 0){
    localStorage.removeItem('connectedWallets')
    sub.unsubscribe()
  } else {
    const walletLabel = wallets.map(({ label }) => label)
    const connectedAccount = wallets.map(({accounts}) => accounts[0])
    const connectedChain = wallets[0].chains[0]     
    const connected = [{
      accounts: connectedAccount,
      chains: connectedChain,
      label: walletLabel}
    ]
    localStorage.setItem(
      'connectedWallets',
      JSON.stringify(connected)
    )
  }
}

export function OnboardSubscribe():() => void {
  const activeOnboard = onboard.state.select('wallets')
  const sub = activeOnboard.subscribe(wallets => {
    StoreOnboardState(wallets, sub)
  })
  return () => { sub.unsubscribe() }
}


export function BlockNativeStatus():JSX.Element {
  const [{wallet, connecting}, connect, disconnect] = useConnectWallet()

  useEffect(() => {
    if (connecting) {
      OnboardSubscribe()
    }
  }, [connect])

  if (wallet) {
    return (<></>)
  }

  return (
    <BlockNativeButton onClick={() => connect({})}>Connect Wallet V2</BlockNativeButton>
  )
}
