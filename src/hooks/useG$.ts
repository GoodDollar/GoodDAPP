import { getTokens } from '@gooddollar/web3sdk'
import useActiveWeb3React from './useActiveWeb3React'
import { useEffect, useState } from 'react'
import { Token } from '@sushiswap/sdk'
import { Token as UToken } from '@uniswap/sdk-core'

export default function useG$() {
    const [token, setToken] = useState<Token | undefined>()
    const { chainId } = useActiveWeb3React()

    useEffect(() => {
        setToken(undefined)
        if (!chainId) return
        void (async () => {
            const [tokens] = await getTokens(chainId as any)
            const G$ = tokens.get('G$') as UToken | undefined
            if (G$) {
                setToken(new Token(chainId, G$.address, G$.decimals, G$.symbol, G$.name))
            }
        })()
    }, [chainId])

    return token
}
