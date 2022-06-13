import memoize from 'lodash/memoize'
import { Fraction } from '@uniswap/sdk-core'
import { NETWORK_LABELS } from 'constants/chains'
import { decimalToFraction } from 'utils/converter'
import { debug, debugGroup, debugGroupEnd } from 'utils/debug'
import { delayedCacheClear } from 'utils/memoize'

type StakingAPY = {
    supplyAPY: Fraction
    incentiveAPY: Fraction
}

/**
 * Returns COMPOUND staking meta intormation from GraphQL request.
 * @param {number} chainId Chain ID.
 * @param {string} tokenAddress Token address.
 * @returns {Fraction}
 * @throws {UnsupportedChainId}
 */
export const compoundStaking = memoize<(chainId: number, tokenAddress: string) => Promise<StakingAPY>>(
    async (chainId, tokenAddress): Promise<StakingAPY> => {
        let [supplyRate, compSupplyAPY] = await fetch(
            `https://api.compound.finance/api/v2/ctoken?addresses=${tokenAddress}&network=${NETWORK_LABELS[chainId]}`
        )
            .then(r => r.json())
            .then(r => [r.cToken[0].supply_rate.value, r.cToken[0].comp_supply_apy.value])
            .catch(() => ['0', '0'])

        if (parseFloat(compSupplyAPY) > 100) {
            compSupplyAPY = '0'
        }

        if (parseFloat(supplyRate) > 1) {
            supplyRate = '0'
        }

        const result = {
            supplyAPY: decimalToFraction(supplyRate),
            incentiveAPY: decimalToFraction(compSupplyAPY)
        }

        debugGroup('Compound Staking')
        debug('Supply Rate', result.supplyAPY.toSignificant(6))
        debug('Compound Supply APY', result.incentiveAPY.toSignificant(6))
        debugGroupEnd('Compound Staking')

        delayedCacheClear(compoundStaking)

        return result
    },
    (chainId, tokenAddress: string) => chainId + tokenAddress
)
