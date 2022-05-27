import { ChainId, Currency, CurrencyAmount, ETHER, JSBI, Token, TokenAmount } from '@sushiswap/sdk'
import { useMemo } from 'react'
import ERC20_INTERFACE from '../../constants/abis/erc20'
import { useActiveWeb3React } from '../../hooks/useActiveWeb3React'
import { useAllTokens } from '../../hooks/Tokens'
import { useMulticallContract } from '../../hooks/useContract'
import { isAddress } from '../../utils'
import { useMultipleContractSingleData, useSingleContractMultipleData } from '../multicall/hooks'
import { FUSE, SUSHI } from '../../constants'

/**
 * Returns a map of the given addresses to their eventually consistent ETH balances.
 */
export function useETHBalances(
    uncheckedAddresses?: (string | undefined)[],
    chainId?: ChainId
): { [address: string]: CurrencyAmount | undefined } {
    const multicallContract = useMulticallContract()

    const addresses: string[] = useMemo(
        () =>
            uncheckedAddresses
                ? uncheckedAddresses
                      .map(isAddress)
                      .filter((a): a is string => a !== false)
                      .sort()
                : [],
        [uncheckedAddresses]
    )

    const results = useSingleContractMultipleData(
        multicallContract,
        'getEthBalance',
        addresses.map(address => [address])
    )

    return useMemo(
        () =>
            addresses.reduce<{ [address: string]: CurrencyAmount }>((memo, address, i) => {
                const value = results?.[i]?.result?.[0]
                if (value) memo[address] = CurrencyAmount.ether(JSBI.BigInt(value.toString()))
                return memo
            }, {}),
        [addresses, results, chainId]
    )
}

/**
 * Returns a map of token addresses to their eventually consistent token balances for a single account.
 */
export function useTokenBalancesWithLoadingIndicator(
    address?: string,
    tokens?: (Token | undefined)[]
): [{ [tokenAddress: string]: TokenAmount | undefined }, boolean] {
    const validatedTokens: Token[] = useMemo(
        () => tokens?.filter((t?: Token): t is Token => isAddress(t?.address) !== false) ?? [],
        [tokens]
    )

    const validatedTokenAddresses = useMemo(() => validatedTokens.map(vt => vt.address), [validatedTokens])

    const balances = useMultipleContractSingleData(validatedTokenAddresses, ERC20_INTERFACE, 'balanceOf', [address])

    const anyLoading: boolean = useMemo(() => balances.some(callState => callState.loading), [balances])

    return [
        useMemo(
            () =>
                address && validatedTokens.length > 0
                    ? validatedTokens.reduce<{ [tokenAddress: string]: TokenAmount | undefined }>((memo, token, i) => {
                          const value = balances?.[i]?.result?.[0]
                          const amount = value ? JSBI.BigInt(value.toString()) : undefined
                          if (amount) {
                              memo[token.address] = new TokenAmount(token, amount)
                          }
                          return memo
                      }, {})
                    : {},
            [address, validatedTokens, balances]
        ),
        anyLoading
    ]
}

export function useTokenBalances(
    address?: string,
    tokens?: (Token | undefined)[]
): { [tokenAddress: string]: TokenAmount | undefined } {
    return useTokenBalancesWithLoadingIndicator(address, tokens)[0]
}

// get the balance for a single token/account combo
export function useTokenBalance(account?: string | null, token?: Token): TokenAmount | undefined {
    const tokenBalances = useTokenBalances(account === null ? undefined : account, [token])
    if (!token) return undefined
    return tokenBalances[token.address]
}

export function useCurrencyBalances(
    account?: string,
    currencies?: (Currency | undefined)[]
): (CurrencyAmount | undefined)[] {
    const tokens = useMemo(() => currencies?.filter((currency): currency is Token => currency instanceof Token) ?? [], [
        currencies
    ])

    const tokenBalances = useTokenBalances(account, tokens)
    const containsETH: boolean = useMemo(
        () => currencies?.some(currency => currency === ETHER || currency === FUSE) ?? false,
        [currencies]
    )
    const ethBalance = useETHBalances(containsETH ? [account] : [])
    const { chainId } = useActiveWeb3React()
    return useMemo(
        () =>
            currencies?.map(currency => {
                if (!account || !currency) return undefined
                if (currency instanceof Token) return tokenBalances[currency.address]
                if (currency === ETHER || currency === FUSE) return ethBalance[account]
                return undefined
            }) ?? [],
        [chainId, account, currencies, ethBalance, tokenBalances]
    )
}

export function useCurrencyBalance(account?: string, currency?: Currency): CurrencyAmount | undefined {
    return useCurrencyBalances(account, [currency])[0]
}

// mimics useAllBalances
export function useAllTokenBalances(): { [tokenAddress: string]: TokenAmount | undefined } {
    const { account } = useActiveWeb3React()
    const allTokens = useAllTokens()
    const allTokensArray = useMemo(() => Object.values(allTokens ?? {}), [allTokens])
    const balances = useTokenBalances(account ?? undefined, allTokensArray)
    return balances ?? {}
}

// get the total owned, unclaimed, and unharvested UNI for account
export function useAggregateUniBalance(): TokenAmount | undefined {
    const { account, chainId } = useActiveWeb3React()

    const uni = chainId ? SUSHI[chainId] : undefined

    const uniBalance: TokenAmount | undefined = useTokenBalance(account ?? undefined, uni)

    if (!uni) return undefined

    return new TokenAmount(uni, uniBalance?.raw ?? JSBI.BigInt(0))
}