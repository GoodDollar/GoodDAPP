import useActiveWeb3React from './useActiveWeb3React'
import React, { ReactNode, ReactNodeArray, useMemo } from 'react'
import Web3 from 'web3'
import { ethers } from 'ethers'
import type { ExternalProvider } from '@ethersproject/providers'

import { useEnvWeb3, GdSdkContext, DAO_NETWORK, getNetworkEnv } from '@gooddollar/web3sdk'

import { Web3Provider } from '@gooddollar/web3sdk-v2'

type NetworkSettings = {
    currentNetwork: string
    rpcs: {
        MAINNET_RPC: string | undefined
        ROPSTEN_RPC: string | undefined
        KOVAN_RPC: string | undefined
        FUSE_RPC: string | undefined
        CELO_RPC: string | undefined
    }
}

export function useNetwork(): NetworkSettings {
    const currentNetwork = process.env.REACT_APP_NETWORK ?? ''

    const rpcs = {
        MAINNET_RPC: process.env.REACT_APP_MAINNET_RPC,
        ROPSTEN_RPC: process.env.REACT_APP_ROPSTEN_RPC,
        KOVAN_RPC: process.env.REACT_APP_KOVAN_RPC,
        FUSE_RPC: process.env.REACT_APP_FUSE_RPC,
        CELO_RPC: process.env.REACT_APP_CELO_RPC,
    }
    localStorage.setItem('GD_NETWORK', JSON.stringify(currentNetwork))
    localStorage.setItem('GD_RPCS', JSON.stringify(rpcs))

    return { currentNetwork, rpcs }
}

export function Web3ContextProvider({ children }: { children: ReactNode | ReactNodeArray }): JSX.Element {
    const { currentNetwork, rpcs } = useNetwork()
    const { eipProvider, chainId } = useActiveWeb3React()

    const [mainnetWeb3] = useEnvWeb3(DAO_NETWORK.MAINNET)

    const web3 = useMemo(() => (eipProvider ? new Web3(eipProvider as any) : mainnetWeb3), [eipProvider, mainnetWeb3])
    const webprovider = useMemo(
        () =>
            eipProvider
                ? new ethers.providers.Web3Provider(eipProvider as ExternalProvider)
                : new ethers.providers.JsonRpcProvider(rpcs.FUSE_RPC),
        [eipProvider, rpcs.FUSE_RPC]
    )

    const mainnetChains = [1, 3, 42]
    let network = getNetworkEnv(currentNetwork)
    if (mainnetChains.indexOf(chainId) !== -1) {
        network += '-mainnet'
    }
    const fuseEnv = network.split('-')[0] || 'production'

    return (
        <GdSdkContext.Provider
            value={{
                web3: web3,
                activeNetwork: currentNetwork,
                rpcs: rpcs,
            }}
        >
            <Web3Provider
                web3Provider={webprovider}
                env={fuseEnv}
                config={{
                    refresh: 100,
                    pollingInterval: 20000,
                    networks: [],
                    readOnlyUrls: {
                        122: 'https://rpc.fuse.io',
                    },
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
        </GdSdkContext.Provider>
    )
}
