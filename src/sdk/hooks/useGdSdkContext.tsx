import React, {createContext, useContext} from 'react'
import Web3 from 'web3'

export interface GdSdkContextInterface {
  web3: Web3 | null,
  activeNetwork: string
}

const GdSdkContext = createContext<GdSdkContextInterface>({
  web3: null,
  activeNetwork: ''
})


export function useGdContext() {
  return useContext(GdSdkContext)
}

export default GdSdkContext



// export function GoodDollarSDKContext({ children, web3, network} : { children: ReactNode | ReactNodeArray, web3: Web3 | null, network: string}) {

//   // add.....

//   return <Context.Provider value={web3}>{children}</Context.Provider>
// }
// export default function useWeb3() {
//   return useContext(GdSdkContext)
// }