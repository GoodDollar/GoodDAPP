import { ApolloClient, gql, InMemoryCache } from '@apollo/client'
import { NormalizedCacheObject } from '@apollo/client/cache/inmemory/types'
import { Fraction } from '@uniswap/sdk-core'
import memoize from 'lodash/memoize'
import { AAVE_STAKING, G$PRICE } from './constants/graphql'
import { UnsupportedChainId } from './utils/errors'
import { decimalToFraction } from './utils/converter'
import { debug, debugGroup, debugGroupEnd } from './utils/debug'
import { delayedCacheClear } from './utils/memoize'
import { isCompositeType } from 'graphql'
import { Token } from '@uniswap/sdk-core'

/**
 * Returns Apollo client to make GraphQL requests.
 * @param {string} uri Client URI.
 * @returns {ApolloClient}
 */
export function getClient(uri: string): ApolloClient<NormalizedCacheObject> {
    return new ApolloClient({ uri, cache: new InMemoryCache() })
}

/**
 * Returns G$ price from GraphQL request.
 * @param {number} chainId Chain ID.
 * @returns {Fraction}
 * @throws {UnsupportedChainId}
 */
export const g$Price = memoize<() => Promise<{ DAI: Fraction; cDAI: Fraction }>>(
    async (): Promise<{ DAI: Fraction; cDAI: Fraction }> => {
        const client = getClient(G$PRICE)

        const {
            data: {
                reserveHistories: [{ openPriceDAI, openPriceCDAI }] = [
                    {
                        openPriceDAI: null,
                        openPriceCDAI: null
                    }
                ] as [{ openPriceDAI: string | null; openPriceCDAI: string | null }]
            } = {}
        } = await client.query({
            query: gql`
                {
                    reserveHistories(first: 1, orderBy: block, orderDirection: desc) {
                        openPriceDAI
                        openPriceCDAI
                    }
                }
            `
        })
        if (!openPriceDAI || !openPriceCDAI) {
            throw new Error('Invalid CDAI or DAI price for G$')
        }

        const result = {
            DAI: decimalToFraction(openPriceDAI),
            cDAI: decimalToFraction(openPriceCDAI)
        }
        debug('G$ to DAI ratio', result.DAI.toSignificant(6))
        debug('G$ to cDAI ratio', result.cDAI.toSignificant(6))

        delayedCacheClear(g$Price)

        return result
    }
)

type StakingAPY = {
    supplyAPY: Fraction
    incentiveAPY: Fraction
}

/**
 * Returns AAVE staking meta intormation from GraphQL request.
 * @param {number} chainId Chain ID.
 * @param {string} tokenSymbol Token symbol.
 * @returns {Fraction}
 * @throws {UnsupportedChainId}
 */
export const aaveStaking = memoize(
    async (chainId: number, token: Token): Promise<StakingAPY> => {
        const client = getClient(AAVE_STAKING[chainId])

        const {
            data: {
                aave,
                assetToken,
                reserves: [{ aEmissionPerSecond, liquidityRate, totalATokenSupply }] = [
                    { aEmissionPerSecond: 0, liquidityRate: 0, totalATokenSupply: 0 }
                ]
            }
        } = await client.query({
            query: gql`{ 
                aave:priceOracleAsset(id: "0x7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9") {    
                    priceInEth
                  }
                  assetToken:priceOracleAsset(id: "${token.address.toLowerCase()}") {    
                    priceInEth
                  }
                reserves( first: 1, where: { underlyingAsset: "${token.address.toLowerCase()}", liquidityRate_gt: 0 }, orderBy: liquidityRate, orderDirection: desc) { totalATokenSupply, aEmissionPerSecond, liquidityRate } 
            }`
        })
        debugGroup('AAVE Staking', { liquidityRate, aEmissionPerSecond, aave, totalATokenSupply })

        //depositAPR = liquidityRate/RAY
        //depositAPY = ((1 + (depositAPR / SECONDS_PER_YEAR)) ^ SECONDS_PER_YEAR) - 1
        // const percentDepositAPR = new Fraction(1, 1)
        const depositAPY = (1 + liquidityRate / (1e27 * 31_536_000)) ** 31_536_000 - 1
        //incentiveDepositAPRPercent = 100 * (aEmissionPerYear * REWARD_PRICE_ETH * WEI_DECIMALS)/
        //                  (totalATokenSupply * TOKEN_PRICE_ETH * UNDERLYING_TOKEN_DECIMALS)

        const aEmissionPerYear = new Fraction(aEmissionPerSecond).multiply(31_536_000)
        const incentiveAPR = aEmissionPerYear
            .multiply(aave?.priceInEth || 0)
            .divide(totalATokenSupply * assetToken.priceInEth * 10 ** (18 - token.decimals))

        debug('percentDepositAPY', depositAPY)
        debug('percentDepositAPR', incentiveAPR.toSignificant(6))
        debugGroupEnd('AAVE Staking')

        delayedCacheClear(aaveStaking)

        return { supplyAPY: new Fraction((depositAPY * 10 ** 10).toFixed(0), 10 ** 10), incentiveAPY: incentiveAPR }
    },
    (chainId, token) => chainId + token.address
)
