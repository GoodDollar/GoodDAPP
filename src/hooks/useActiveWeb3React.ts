import { Web3ReactContextInterface } from '@web3-react/core/dist/types'
import { Web3Provider } from '@ethersproject/providers'
import { ChainId } from '@sushiswap/sdk'
import { NetworkContextName } from '../constants'
import { useActiveOnboard } from './useActiveOnboard'
import type { ActiveOnboard } from './useActiveOnboard'
import type { Account } from '@web3-onboard/core/dist/types'

export function useActiveWeb3React(): ActiveOnboard<Web3Provider> & {chainId?: ChainId; label?: string } | Web3ReactContextInterface<Web3Provider> & { chainId?: ChainId, label?: string } {
  const context = useActiveOnboard<Web3Provider>()  
  return context
}

export default useActiveWeb3React
