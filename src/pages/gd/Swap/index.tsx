import React, { memo } from 'react'
import { UniSwap } from './SwapCelo/UniSwap'

import { SupportedChains } from '@gooddollar/web3sdk-v2'
import useActiveWeb3React from 'hooks/useActiveWeb3React'
import SwapCore from './SwapCore'

const Swap = memo(() => {
    const { chainId } = useActiveWeb3React()
    return (chainId as any) === SupportedChains.CELO ? <UniSwap /> : <SwapCore />
})

export default Swap
