import { useEffect, useState } from 'react'
import { ethers } from 'ethers'
import Web3 from 'web3'
import { SupportedChainId, NETWORK_LABELS, DAO_NETWORK } from 'sdk/constants/chains'
import useActiveWeb3React from 'hooks/useActiveWeb3React'
import useWeb3 from 'hooks/useWeb3'
import { getNetworkEnv } from 'sdk/constants/addresses'
const RPC = {
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
console.log('env', process.env)
/**
 * Returns provider for chain.
 * @param {number | string} chainId Chain ID.
 */
export const useEnvWeb3 = (dao: DAO_NETWORK): [Web3 | null, SupportedChainId] => {
    const activeWeb3 = useWeb3()
    const { account, chainId: activeChainId } = useActiveWeb3React()
    const [web3, setWeb3] = useState<[Web3 | null, SupportedChainId]>([null, 0])

    useEffect(() => {
        const getProvider = async () => {
            const networkEnv = getNetworkEnv()
            let provider,
                selectedChainId = SupportedChainId.MAINNET
            if (dao === DAO_NETWORK.FUSE) {
                if (account && (activeChainId as number) === SupportedChainId.FUSE) {
                    return setWeb3([activeWeb3, activeChainId as number])
                } else provider = new Web3.providers.HttpProvider(RPC[SupportedChainId.FUSE])
            } else {
                //"mainnet" contracts can be on different blockchains depending on env
                switch (networkEnv) {
                    case 'production':
                        if (account && activeChainId && SupportedChainId.MAINNET === (activeChainId as number)) {
                            return setWeb3([activeWeb3, activeChainId as number])
                        }
                        provider = new Web3.providers.HttpProvider(RPC[SupportedChainId.MAINNET])
                        selectedChainId = SupportedChainId.MAINNET
                        break
                    case 'staging':
                        console.log('useEnvWeb3: staging', activeChainId)
                        if (
                            account &&
                            activeChainId &&
                            [SupportedChainId.KOVAN, SupportedChainId.ROPSTEN].includes(activeChainId as number)
                        ) {
                            return setWeb3([activeWeb3, activeChainId as number])
                        }
                        provider = new Web3.providers.HttpProvider(RPC[SupportedChainId.ROPSTEN])
                        selectedChainId = SupportedChainId.ROPSTEN

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
    }, [activeWeb3, dao, activeChainId, account])

    return web3
}
