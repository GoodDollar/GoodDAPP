import { Web3Provider } from '@ethersproject/providers'
import { ChainId } from '@sushiswap/sdk'
import { useActiveOnboard, EIP1193ProviderExtended } from './useActiveOnboard'
import type { ActiveOnboard } from './useActiveOnboard'

export function useActiveWeb3React(): ActiveOnboard<Web3Provider> & {
    chainId: ChainId
    label?: string
    eipProvider?: EIP1193ProviderExtended
} {
    const context = useActiveOnboard<Web3Provider>()
    return context
}

export default useActiveWeb3React
