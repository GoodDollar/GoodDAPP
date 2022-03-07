import useActiveWeb3React from './useActiveWeb3React'
import React, { createContext, ReactNode, ReactNodeArray, useContext, useMemo } from 'react'
import Web3 from 'web3'

const Context = createContext<Web3 | null>(null)

export function Web3ContextProvider({ children }: { children: ReactNode | ReactNodeArray }) {
    const { library } = useActiveWeb3React()
    console.log("web3context", { library, Web3 })
    const web3 = useMemo(() => (library ? new Web3(library.provider as any) : null), [library])
    return <Context.Provider value={web3}>{children}</Context.Provider>
}

export default function useWeb3() {
    return useContext(Context)
}
