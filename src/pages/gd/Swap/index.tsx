import React, { memo } from 'react'
import { UbeSwap } from './SwapCelo'

import { SupportedChainId } from '@gooddollar/web3sdk'
import useActiveWeb3React from 'hooks/useActiveWeb3React'
import SwapCore from './SwapCore'

const Swap = memo(() => {
    const { chainId } = useActiveWeb3React()
    return (chainId as any) === SupportedChainId.CELO ? <UbeSwap /> : <SwapCore />
})

export default Swap
