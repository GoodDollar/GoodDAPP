import useActiveWeb3React from './useActiveWeb3React'
import React, { createContext, ReactNode, ReactNodeArray, useContext, useMemo } from 'react'
import Web3 from 'web3'

import { useEnvWeb3, GdSdkContext, DAO_NETWORK, getNetworkEnv } from '@gooddollar/web3sdk'

const Context = createContext<Web3 | null>(null)

export function Web3ContextProvider({ children }: { children: ReactNode | ReactNodeArray }) {
    const { eipProvider } = useActiveWeb3React()
    const [mainnetWeb3] = useEnvWeb3(DAO_NETWORK.MAINNET)
    const web3 = useMemo(() => (eipProvider ? new Web3(eipProvider as any) : mainnetWeb3), 
      [eipProvider, mainnetWeb3]
    )
    const defaultNetwork = process.env.REACT_APP_NETWORK ?? ''
    const rpcs = {
      MAINNET_RPC: process.env.REACT_APP_MAINNET_RPC,
      ROPSTEN_RPC: process.env.REACT_APP_ROPSTEN_RPC,
      KOVAN_RPC: process.env.REACT_APP_KOVAN_RPC,
      FUSE_RPC: process.env.REACT_APP_FUSE_RPC
    }
    localStorage.setItem(
      'GD_NETWORK',
      JSON.stringify(defaultNetwork)
    )
    localStorage.setItem(
      'GD_RPCS',
      JSON.stringify(rpcs)
    )
    const network = getNetworkEnv(defaultNetwork)
    return <GdSdkContext.Provider value={{web3: web3, activeNetwork: network, rpcs: rpcs}}>{children}</GdSdkContext.Provider>
}

export default function useWeb3() {
    return useContext(Context)
}

