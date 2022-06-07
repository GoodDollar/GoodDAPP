import useActiveWeb3React from './useActiveWeb3React'
import React, { createContext, ReactNode, ReactNodeArray, useContext, useMemo } from 'react'
import Web3 from 'web3'
import { useEnvWeb3 } from 'sdk/hooks/useEnvWeb3'
import { DAO_NETWORK } from 'sdk/constants/chains'


const Context = createContext<Web3 | null>(null)

export function Web3ContextProvider({ children }: { children: ReactNode | ReactNodeArray }) {
    const { eipProvider } = useActiveWeb3React()
    const [mainnetWeb3] = useEnvWeb3(DAO_NETWORK.MAINNET)
    const web3 = useMemo(() => (eipProvider ? new Web3(eipProvider as any) : mainnetWeb3), 
      [eipProvider, mainnetWeb3]
    )
    return <Context.Provider value={web3}>{children}</Context.Provider>
}

export default function useWeb3() {
    return useContext(Context)
}