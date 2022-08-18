import { createContext, useContext, useEffect, useState } from 'react'
import useActiveWeb3React from 'hooks/useActiveWeb3React'
import { getTokenList } from '@gooddollar/web3sdk'
import { ETHER, Currency, Token } from '@sushiswap/sdk'
import { AdditionalChainId, FUSE } from 'constants/index'

export interface SwapVariant {
    token: Currency
    value: string
}

interface SlippageTolerance {
    custom: boolean
    value: string
}

export interface ISwapContext {
    slippageTolerance: SlippageTolerance
    setSlippageTolerance: (value: SlippageTolerance) => void
    tokenList: Currency[]
    tokenListLoading: boolean
    swapPair: SwapVariant
    setSwapPair: (value: Partial<SwapVariant>) => void
    buying: boolean
    setBuying: (value: boolean) => void
}

export const SwapContext = createContext<ISwapContext>(null as any)

export function useTokens() {
    const { chainId } = useActiveWeb3React()
    const [tokens, setTokens] = useState<Currency[] | null>(null)
    useEffect(() => {
        setTokens(!chainId ? [] : null)
        chainId &&
            (async () => {
                try {
                    const list = await getTokenList(chainId as any)
                    setTokens(
                        list.map(currency =>
                            currency.isNative
                                ? (chainId as any) === AdditionalChainId.FUSE
                                    ? FUSE
                                    : ETHER
                                : new Token(
                                      chainId,
                                      currency.address,
                                      currency.decimals,
                                      currency.symbol,
                                      currency.name
                                  )
                        )
                    )
                } catch (e) {
                    console.error(e)
                    setTokens([])
                }
            })()
    }, [chainId])

    return tokens
}

export function useSwap() {
    return useContext(SwapContext)
}
