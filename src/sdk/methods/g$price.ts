import Web3 from 'web3'
import { Currency, Price } from '@uniswap/sdk-core'
import memoize from 'lodash/memoize'
import { delayedCacheClear } from '../utils/memoize'
import { getContract } from 'sdk/utils/getContract'
import { DAI, CDAI, G$ } from 'sdk/constants/tokens'

/**
 * Calculates cDAI -> DAI ratio.
 * @param {Web3} web3 Web3 instance.
 * @param {number} chainId Chain ID for cache.
 * @returns {Fraction} Ratio.
 */
export const g$ReservePrice = memoize<
    (web3: Web3, chainId: number) => Promise<{ DAI: Price<Currency, Currency>; cDAI: Price<Currency, Currency> }>
>(
    async (web3, chainId): Promise<{ DAI: Price<Currency, Currency>; cDAI: Price<Currency, Currency> }> => {
        const contract = getContract(
            chainId,
            'GoodReserveCDai',
            ['function currentPrice() view returns (uint256)', 'function currentPriceDAI() view returns (uint256)'],
            web3
        )
        const [cdaiPrice, daiPrice] = await Promise.all([contract.currentPrice(), contract.currentPriceDAI()])

        delayedCacheClear(g$ReservePrice)

        const priceAsDAI = new Price(DAI[chainId], G$[chainId], daiPrice, 100)
        const priceAscDAI = new Price(CDAI[chainId], G$[chainId], cdaiPrice, 100)
        return { DAI: priceAsDAI, cDAI: priceAscDAI }
    },
    (_, chainId) => chainId
)
