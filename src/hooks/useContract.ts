import { ChainId } from '@sushiswap/sdk'

import { MERKLE_DISTRIBUTOR_ADDRESS } from '../constants'
import { FAUCET_ABI, FAUCET_ADDRESS } from '../constants/abis/faucet'
import { MULTICALL_ABI, MULTICALL_NETWORKS } from '../constants/multicall'

import { Contract } from '@ethersproject/contracts'
import { abi as STAKING_REWARDS_ABI } from '@uniswap/liquidity-staker/build/StakingRewards.json'
import { abi as MERKLE_DISTRIBUTOR_ABI } from '@uniswap/merkle-distributor/build/MerkleDistributor.json'
import { abi as IUniswapV2PairABI } from '@uniswap/v2-core/build/IUniswapV2Pair.json'
import { useMemo } from 'react'
import ENS_PUBLIC_RESOLVER_ABI from '../constants/abis/ens-public-resolver.json'
import ENS_ABI from '../constants/abis/ens-registrar.json'
import { ERC20_BYTES32_ABI } from '../constants/abis/erc20'
import PENDING_ABI from '../constants/abis/pending.json'
import { getContract } from '../utils'
import { useActiveWeb3React } from './useActiveWeb3React'

// returns null on errors
export function useContract(address: string | undefined, ABI: any, withSignerIfPossible = true): Contract | null {
    const { library, account } = useActiveWeb3React()

    return useMemo(() => {
        if (!address || !ABI || !library) return null
        try {
            return getContract(address, ABI, library, withSignerIfPossible && account ? account : undefined)
        } catch (error) {
            console.error('Failed to get contract', error)
            return null
        }
    }, [address, ABI, library, withSignerIfPossible, account])
}

export function useENSRegistrarContract(withSignerIfPossible?: boolean): Contract | null {
    const { chainId } = useActiveWeb3React()
    let address: string | undefined
    if (chainId) {
        switch (chainId) {
            case ChainId.MAINNET:
            case ChainId.GÖRLI:
            case ChainId.ROPSTEN:
            case ChainId.RINKEBY:
                address = '0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e'
                break
        }
    }
    return useContract(address, ENS_ABI, withSignerIfPossible)
}

export function useENSResolverContract(address: string | undefined, withSignerIfPossible?: boolean): Contract | null {
    return useContract(address, ENS_PUBLIC_RESOLVER_ABI, withSignerIfPossible)
}

export function useBytes32TokenContract(tokenAddress?: string, withSignerIfPossible?: boolean): Contract | null {
    return useContract(tokenAddress, ERC20_BYTES32_ABI, withSignerIfPossible)
}

export function usePairContract(pairAddress?: string, withSignerIfPossible?: boolean): Contract | null {
    return useContract(pairAddress, IUniswapV2PairABI, withSignerIfPossible)
}

export function useMerkleDistributorContract(): Contract | null {
    const { chainId } = useActiveWeb3React()
    return useContract(chainId ? MERKLE_DISTRIBUTOR_ADDRESS[chainId] : undefined, MERKLE_DISTRIBUTOR_ABI, true)
}

export function useStakingContract(stakingAddress?: string, withSignerIfPossible?: boolean): Contract | null {
    return useContract(stakingAddress, STAKING_REWARDS_ABI, withSignerIfPossible)
}

export function usePendingContract(): Contract | null {
    return useContract('0x9aeadfE6cd03A2b5730474bF6dd79802d5bCD029', PENDING_ABI, false)
}

export function useMulticallContract(): Contract | null {
    const { chainId } = useActiveWeb3React()
    return useContract(chainId && MULTICALL_NETWORKS[chainId], MULTICALL_ABI, false)
}

export function useFaucetContract(withSignerIfPossible?: boolean): Contract | null {
    return useContract(FAUCET_ADDRESS, FAUCET_ABI, withSignerIfPossible)
}
