// export {}
import React, { useEffect } from 'react'
import { ChainId } from '@sushiswap/sdk'


export type MetaMaskInfo = {
  isMetaMask: boolean,
  isMultiple: boolean
}

/*
* checks for multiple providers and if exists
* puts MetaMask as selectedProvider
* returns boolean metaMask exists at all
*/

export default function useSelectedProvider():MetaMaskInfo {
  const { ethereum } = window
  const isMultiple = ethereum && ethereum.providers?.length > 1
  useEffect(() => {
    let provider:any 
    if (window.ethereum && isMultiple && !ethereum.selectedProvider) { 
      provider = ethereum.providers.find((provider: any) => provider.isMetaMask)
      window.ethereum.selectedProvider = provider
    }
  }, [ethereum, isMultiple])

  const isMetaMask = ethereum && (isMultiple ? ethereum.selectedProvider?.isMetaMask : ethereum.isMetaMask)
  return {
    isMetaMask: isMetaMask ?? false,
    isMultiple: isMultiple ?? false
  }
}

export function metaMaskRequests(info: MetaMaskInfo, type: string, account?:string | null | undefined):void {
  const { ethereum } = window
  if (type === 'add' && account) {
    ;(info.isMultiple ? ethereum?.selectedProvider as any : ethereum as any).request({
      method: 'wallet_addEthereumChain',
      params: [
          {
              chainId: '0x7a',
              chainName: 'Fuse',
              nativeCurrency: {
                  name: 'FUSE Token',
                  symbol: 'FUSE',
                  decimals: 18
              },
              rpcUrls: [process.env.REACT_APP_FUSE_RPC],
              blockExplorerUrls: ['https://explorer.fuse.io']
          },
          account
      ]
    })
  } else if (type === 'switch') {
    ;(info.isMultiple ? ethereum?.selectedProvider as any : ethereum as any)?.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: `0x${ChainId.MAINNET.toString(16)}` }]
    })
  }
}



