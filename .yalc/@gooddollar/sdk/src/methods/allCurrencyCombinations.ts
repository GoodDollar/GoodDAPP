import { Currency, Token } from '@uniswap/sdk-core'
import flatMap from 'lodash/flatMap'
import memoize from 'lodash/memoize'

import { ADDITIONAL_BASES, BASES_TO_CHECK_TRADES_AGAINST, CUSTOM_BASES } from 'constants/routing'
import { SupportedChainId } from 'constants/chains'
import { getTokens } from './tokenLists'

/**
 * Calculates all currency combinations in given chain that could be used to build exchange path.
 * @param {SupportedChainId} chainId Chain ID.
 * @param {Currency} currencyA Currency from.
 * @param {Currency} currencyB Currency to.
 * @returns {Promise<Array<[Currency, Currency]>>} List of pairs.
 */
export const allCurrencyCombinations = memoize<
    (chainId: SupportedChainId, currencyA?: Currency, currencyB?: Currency) => Promise<Array<[Currency, Currency]>>
>(
    async (chainId, currencyA?, currencyB?): Promise<Array<[Currency, Currency]>> => {
        const [tokenA, tokenB] = chainId ? [currencyA?.wrapped, currencyB?.wrapped] : [undefined, undefined]

        let bases: Currency[] = []

        if (chainId) {
            const common = BASES_TO_CHECK_TRADES_AGAINST[chainId] ?? []
            const additionalA = tokenA ? ADDITIONAL_BASES[chainId]?.[tokenA.address] ?? [] : []
            const additionalB = tokenB ? ADDITIONAL_BASES[chainId]?.[tokenB.address] ?? [] : []

            bases = [...common, ...additionalA, ...additionalB]
        }

        if (chainId === SupportedChainId.FUSE) {
            const [fuseTokens] = await getTokens(SupportedChainId.FUSE)
            bases = [...bases, ...Array.from(fuseTokens.values())]
        }

        const basePairs: [Currency, Currency][] = flatMap(bases, (base): [Currency, Currency][] =>
            bases.map(otherBase => [base, otherBase])
        )

        return tokenA && tokenB
            ? [
                  // the direct pair
                  [tokenA, tokenB],
                  // token A against all bases
                  ...bases.map((base): [Currency, Currency] => [tokenA, base]),
                  // token B against all bases
                  ...bases.map((base): [Currency, Currency] => [tokenB, base]),
                  // each base against all bases
                  ...basePairs
              ]
                  .filter((tokens): tokens is [Token, Token] => Boolean(tokens[0] && tokens[1]))
                  .filter(([t0, t1]) => t0.address !== t1.address)
                  .filter(([tokenA, tokenB]) => {
                      if (!chainId) return true
                      const customBases = CUSTOM_BASES[chainId]

                      const customBasesA: Token[] | undefined = customBases?.[tokenA.address]
                      const customBasesB: Token[] | undefined = customBases?.[tokenB.address]

                      if (!customBasesA && !customBasesB) return true

                      if (customBasesA && !customBasesA.find(base => tokenB.equals(base))) return false
                      return !(customBasesB && !customBasesB.find(base => tokenA.equals(base)))
                  })
            : []
    },
    (...args: any[]) => args[0] + args[1].symbol + args[2].symbol
)
