import useActiveWeb3React from './useActiveWeb3React'
import React, { createContext, ReactNode, ReactNodeArray, useContext, useEffect, useMemo } from 'react'
import Web3 from 'web3'
import { ethers } from 'ethers'

import { useEnvWeb3, GdSDkContext } from '@gooddollar/web3sdk/dist/hooks/'
import { DAO_NETWORK } from '@gooddollar/web3sdk/dist/constants/'
import { getNetworkEnv } from '@gooddollar/web3sdk/dist/constants/addresses'

import { Web3Provider } from '@gooddollar/web3sdk-v2'

// TODO: remove
const Context = createContext<Web3 | null>(null)

export function useNetwork() {
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

    return { defaultNetwork, rpcs }
}

//TODO: make proper keys for fuse rpc

export function Web3ContextProvider({ children }: { children: ReactNode | ReactNodeArray }) {
    const { defaultNetwork, rpcs } = useNetwork()
    const { eipProvider, chainId } = useActiveWeb3React()
    
    const [mainnetWeb3] = useEnvWeb3(DAO_NETWORK.MAINNET)

    const web3 = useMemo(() => (eipProvider ? new Web3(eipProvider as any) : mainnetWeb3), 
      [eipProvider, mainnetWeb3]
    )
    const webprovider = useMemo(() => (eipProvider && new ethers.providers.Web3Provider(eipProvider as any)), [eipProvider])

    const mainnetChains = [1, 3, 42]
    let network = getNetworkEnv(defaultNetwork)
    if (mainnetChains.indexOf(chainId) !== -1) {
      network += '-mainnet'
    }
    const fuseEnv = network.split("-")[0] || "production";
    console.log('networks -->', {network, defaultNetwork}) 

    // console.log('web3provider -- network -->', {webprovider, network})

    return <GdSDkContext.Provider value={{
      web3: web3, 
      activeNetwork: defaultNetwork, 
      rpcs: rpcs
      }}>
        <Web3Provider 
          web3Provider={webprovider} 
          env={fuseEnv}
          config={{
            pollingInterval: 15,
            networks: [],
            readOnlyUrls: {
              122: 'https://rpc.fuse.io'
            }
          }}
          // config={{ multicallVersion: 1, networks: [Fuse, Mainnet, Ropsten, Kovan], readOnlyUrls: { 
          //   122: 'https://rpc.fuse.io',
          //   42: 'https://kovan.infura.io/v3/12207372b62941dfb1efd4fe26b95ccc',
          //   3: 'https://ropsten.infura.io/v3/12207372b62941dfb1efd4fe26b95ccc',
          //   1: 'https://eth-mainnet.alchemyapi.io/v2/2kSbx330Sc8S3QRwD9nutr9XST_DfeJh' 
          // } }}
        >
          {children}
        </Web3Provider>
    </GdSDkContext.Provider>
}


// TODO: remove
export default function useWeb3() {
    return useContext(Context)
}

