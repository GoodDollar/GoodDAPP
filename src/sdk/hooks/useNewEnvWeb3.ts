import { useEffect, useState, useContext } from 'react'
import { ethers } from 'ethers'
import Web3 from 'web3'
import { SupportedChainId, DAO_NETWORK } from 'sdk/constants/chains'
import { getNetworkEnv } from 'sdk/constants/addresses'
import GdSdkContext from 'sdk/hooks/useGdSdkContext'
export const RPC = {
    [SupportedChainId.MAINNET]:
        process.env.REACT_APP_MAINNET_RPC ||
        (ethers.getDefaultProvider('mainnet') as any).providerConfigs[0].provider.connection.url,
    [SupportedChainId.ROPSTEN]:
        process.env.REACT_APP_ROPSTEN_RPC ||
        (ethers.getDefaultProvider('ropsten') as any).providerConfigs[0].provider.connection.url,
    [SupportedChainId.KOVAN]:
        process.env.REACT_APP_KOVAN_RPC ||
        (ethers.getDefaultProvider('kovan') as any).providerConfigs[0].provider.connection.url,
    [SupportedChainId.FUSE]: process.env.REACT_APP_FUSE_RPC || 'https://rpc.fuse.io'
}

/**
 * Returns provider for chain.
 * @param {number | string} chainId Chain ID.
 */
export const useEnvWeb3 = (dao: DAO_NETWORK, activeWeb3?: any | undefined, activeChainId?: number): [Web3 | null, SupportedChainId] => {
    const [web3, setWeb3] = useState<[any, SupportedChainId]>([null, 0])
    const {activeNetwork} = useContext(GdSdkContext)

    useEffect(() => {
        const getProvider = async () => {
            const networkEnv = getNetworkEnv(activeNetwork)
            let provider,
                selectedChainId = SupportedChainId.MAINNET            
            if (dao === DAO_NETWORK.FUSE) {
              if (activeWeb3 && (activeChainId as number) === SupportedChainId.FUSE) {
                return setWeb3([activeWeb3, activeChainId as number])
              } else provider = new Web3.providers.HttpProvider(RPC[SupportedChainId.FUSE])
            } else {
                //"mainnet" contracts can be on different blockchains depending on env
                switch (networkEnv) {
                    case 'production':
                        if (activeWeb3 && activeChainId && SupportedChainId.MAINNET === (activeChainId as number)) {
                            return setWeb3([activeWeb3, activeChainId as number])
                        }
                        provider = new Web3.providers.HttpProvider(RPC[SupportedChainId.MAINNET])
                        selectedChainId = SupportedChainId.MAINNET
                        break
                    case 'staging':
                        // console.log('useEnvWeb3: staging', activeChainId)
                        if (
                            activeWeb3 &&
                            activeChainId &&
                            [SupportedChainId.KOVAN, SupportedChainId.ROPSTEN].includes(activeChainId as number)
                        ) {
                            return setWeb3([activeWeb3, activeChainId as number])
                        }
                        provider = new Web3.providers.HttpProvider(RPC[SupportedChainId.KOVAN])
                        selectedChainId = SupportedChainId.KOVAN

                        break
                    default:
                        provider = new Web3.providers.HttpProvider(RPC[SupportedChainId.ROPSTEN])
                        selectedChainId = SupportedChainId.ROPSTEN
                        break
                }
            }
            setWeb3([new Web3(provider), selectedChainId])
        }
        getProvider()
    }, [activeWeb3, dao, activeChainId])

    return web3
}
