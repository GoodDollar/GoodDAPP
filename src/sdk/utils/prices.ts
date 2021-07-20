import JSBI from 'jsbi'
import { Currency, Percent, TradeType } from '@uniswap/sdk-core'
import { Trade } from '@uniswap/v2-sdk'

const THIRTY_BIPS_FEE = new Percent(JSBI.BigInt(30), JSBI.BigInt(10000))
const ONE_HUNDRED_PERCENT = new Percent(JSBI.BigInt(10000), JSBI.BigInt(10000))
const INPUT_FRACTION_AFTER_FEE = ONE_HUNDRED_PERCENT.subtract(THIRTY_BIPS_FEE)

/**
 * Computes realized lp fee as a percent.
 * @param {Trade} trade Givem trade.
 * @returns {Percent}
 */
export function computeRealizedLPFeePercent(trade: Trade<Currency, Currency, TradeType>): Percent {
  // For each hop in our trade, take away the x*y=k price impact from 0.3% fees
  // e.g. for 3 tokens/2 hops: 1 - ((1 - .03) * (1 - .03))
  const percent: Percent = ONE_HUNDRED_PERCENT.subtract(
    trade.route.pairs.reduce<Percent>(
      (currentFee: Percent): Percent => currentFee.multiply(INPUT_FRACTION_AFTER_FEE),
      ONE_HUNDRED_PERCENT
    )
  )

  return new Percent(percent.numerator, percent.denominator)
}
