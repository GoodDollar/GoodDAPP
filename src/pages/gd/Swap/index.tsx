import React, { memo } from 'react'
import { UniSwap } from './SwapCelo/UniSwap'

import { SupportedChainId } from '@gooddollar/web3sdk'
import useActiveWeb3React from 'hooks/useActiveWeb3React'
import SwapCore from './SwapCore'

const Swap = memo(() => {
    const { chainId } = useActiveWeb3React()
    return (chainId as any) === SupportedChainId.CELO ? <UniSwap /> : <SwapCore />
})

export default Swap
