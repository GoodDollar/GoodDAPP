import { useEffect, useState } from 'react'
import { ChainId } from '@sushiswap/sdk'
import { useGetEnvChainId, useReadOnlyProvider } from '@gooddollar/web3sdk-v2'

import { hasSavingsBalance } from 'functions'

export default function useHasBalance(account: string, requiredChain: ChainId): boolean | undefined {
    const [hasBalance, setHasBalance] = useState<boolean | undefined>(false)
    const { defaultEnv } = useGetEnvChainId(requiredChain)
    const provider = useReadOnlyProvider(requiredChain)

    useEffect(() => {
        if (!account || !provider) {
            return
        }

        hasSavingsBalance({ account, provider, defaultEnv })
            .then(setHasBalance)
            .catch((e) => console.log('checking savings balance error', { e }))
    }, [account, setHasBalance, provider, defaultEnv, requiredChain])

    return hasBalance
}
