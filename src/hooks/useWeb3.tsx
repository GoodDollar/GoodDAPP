import useActiveWeb3React from './useActiveWeb3React'
import React, { createContext, ReactNode, ReactNodeArray, useContext, useMemo } from 'react'
import Web3 from 'web3'
import { useEnvWeb3 } from 'sdk/hooks/useNewEnvWeb3'
import { DAO_NETWORK } from 'sdk/constants/chains'
import GdSdkContext from 'sdk/hooks/useGdSdkContext'
import { getNetworkEnv } from 'sdk/constants/addresses'

const Context = createContext<Web3 | null>(null)

export function Web3ContextProvider({ children }: { children: ReactNode | ReactNodeArray }) {
    const { eipProvider } = useActiveWeb3React()
    const [mainnetWeb3] = useEnvWeb3(DAO_NETWORK.MAINNET)
    const web3 = useMemo(() => (eipProvider ? new Web3(eipProvider as any) : mainnetWeb3), 
      [eipProvider, mainnetWeb3]
    )
    const defaultNetwork = process.env.REACT_APP_NETWORK ?? ''
    // const currentRpcs = {
    //   KOVAN_RPC: process.env.REACT_APP_KOVAN_RPC,
    //   ROPSTEN_RPC: process.env.REACT_APP_ROPSTEN_RPC,
    //   MAINNET_RPC: process.env.REACT_APP_MAINNET_RPC,
    //   FUSE_RPC: process.env.REACT_APP_FUSE_RPC
    // }
    // how to bubble RPC's down to SDK ? should it even?
    // console.log('defaultNetwork -->', {defaultNetwork})
    localStorage.setItem(
      'GD_NETWORK',
      JSON.stringify(defaultNetwork)
    )
    const network = getNetworkEnv(defaultNetwork)
    return <GdSdkContext.Provider value={{web3: web3, activeNetwork: network}}>{children}</GdSdkContext.Provider>
}

export default function useWeb3() {
    return useContext(Context)
}

