import { ExternalProvider } from '@ethersproject/providers'
import { DAO_NETWORK, GdSdkContext, getNetworkEnv, useEnvWeb3 } from '@gooddollar/web3sdk'
import { Goerli, Mainnet } from '@usedapp/core'
import { ethers } from 'ethers'
import React, { ReactNode, ReactNodeArray, useMemo } from 'react'
import Web3 from 'web3'
import useActiveWeb3React from './useActiveWeb3React'

import { Celo, Fuse, Web3Provider } from '@gooddollar/web3sdk-v2'

type NetworkSettings = {
    currentNetwork: string
    rpcs: {
        MAINNET_RPC: string | undefined
        FUSE_RPC: string | undefined
        CELO_RPC: string | undefined
    }
}

export function useNetwork(): NetworkSettings {
    const currentNetwork = process.env.REACT_APP_NETWORK || 'fuse'
    const rpcs = {
        MAINNET_RPC:
            process.env.REACT_APP_MAINNET_RPC ||
            (ethers.getDefaultProvider('mainnet') as any).providerConfigs[0].provider.connection.url,
        FUSE_RPC: process.env.REACT_APP_FUSE_RPC || 'https://rpc.fuse.io',
        CELO_RPC: process.env.REACT_APP_CELO_RPC || 'https://forno.celo.org',
    }
    localStorage.setItem('GD_RPCS', JSON.stringify(rpcs)) //this is required for sdk v1

    return { currentNetwork, rpcs }
}

export function Web3ContextProvider({ children }: { children: ReactNode | ReactNodeArray }): JSX.Element {
    const { rpcs } = useNetwork()
    const { eipProvider } = useActiveWeb3React()

    const [mainnetWeb3] = useEnvWeb3(DAO_NETWORK.MAINNET)

    const web3 = useMemo(() => (eipProvider ? new Web3(eipProvider as any) : mainnetWeb3), [eipProvider, mainnetWeb3])
    const webprovider = useMemo(
        () => eipProvider && new ethers.providers.Web3Provider(eipProvider as ExternalProvider, 'any'),
        [eipProvider]
    )

    const contractsEnv = getNetworkEnv()

    return (
        <GdSdkContext.Provider
            value={{
                web3: web3,
                contractsEnv,
                rpcs: rpcs,
            }}
        >
            <Web3Provider
                web3Provider={webprovider}
                env={contractsEnv}
                config={{
                    networks: [Goerli, Mainnet, Fuse, Celo],
                    readOnlyChainId: undefined,
                    readOnlyUrls: {
                        1: 'https://rpc.ankr.com/eth',
                        122: 'https://rpc.fuse.io',
                        42220: 'https://forno.celo.org',
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
