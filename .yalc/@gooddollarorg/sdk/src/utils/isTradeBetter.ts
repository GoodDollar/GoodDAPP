import { Trade } from '@uniswap/v2-sdk'
import { Currency, Percent, TradeType } from '@uniswap/sdk-core'

import { ONE_HUNDRED_PERCENT, ZERO_PERCENT } from 'constants/misc'

/**
 * Returns whether tradeB is better than tradeA by at least a threshold percentage amount.
 * @param {Trade} tradeA Trade A.
 * @param {Trade} tradeB Trade B.
 * @param {Percent=ZERO_PERCENT} minimumDelta Minimum delta between trade A and trade B.
 * @returns {boolean | undefined}
 * @throws {Error} If tries to compare incomparable trades.
 */
export function isTradeBetter(
  tradeA: Trade<Currency, Currency, TradeType> | undefined | null,
  tradeB: Trade<Currency, Currency, TradeType> | undefined | null,
  minimumDelta: Percent = ZERO_PERCENT
): boolean | undefined {
  if (tradeA && !tradeB) return false
  if (tradeB && !tradeA) return true
  if (!tradeA || !tradeB) return undefined

  if (
    tradeA.tradeType !== tradeB.tradeType ||
    !tradeA.inputAmount.currency.equals(tradeB.inputAmount.currency) ||
    !tradeB.outputAmount.currency.equals(tradeB.outputAmount.currency)
  ) {
    throw new Error('Comparing incomparable trades')
  }

  if (minimumDelta.equalTo(ZERO_PERCENT)) {
    return tradeA.executionPrice.lessThan(tradeB.executionPrice)
  } else {
    return tradeA.executionPrice.asFraction
      .multiply(minimumDelta.add(ONE_HUNDRED_PERCENT))
      .lessThan(tradeB.executionPrice)
  }
}
