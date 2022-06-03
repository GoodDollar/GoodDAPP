import { Currency, CurrencyAmount, TradeType } from "@uniswap/sdk-core";
import { Trade } from "@uniswap/v2-sdk";

import { allCommonPairs } from "./allCommonPairs";
import { isTradeBetter } from "utils/isTradeBetter";
import { BETTER_TRADE_LESS_HOPS_THRESHOLD } from "constants/misc";
import { SupportedChainId } from "constants/chains";

const MAX_HOPS = 2

/**
 * Returns the best trade for the token in to the exact amount of token out.
 * @param {Currency} currencyIn Currency exchange to.
 * @param {CurrencyAmount} currencyAmountOut Currency exchange from
 * @param {number=3} maxHops Maximum hops to find the best exchange route.
 * @param {SupportedChainId} chainId Chain ID.
 * @returns {Promise<Trade>}
 */
export async function v2TradeExactOut(
  currencyIn?: Currency,
  currencyAmountOut?: CurrencyAmount<Currency>,
  { maxHops = MAX_HOPS, chainId = SupportedChainId.MAINNET } = {}
): Promise<Trade<Currency, Currency, TradeType.EXACT_OUTPUT> | null> {
  const allowedPairs = await allCommonPairs(chainId, currencyIn, currencyAmountOut?.currency)

  if (currencyIn && currencyAmountOut && allowedPairs.length > 0) {
    if (maxHops === 1) {
      return (
        Trade.bestTradeExactOut(allowedPairs, currencyIn, currencyAmountOut, { maxHops: 1, maxNumResults: 1 })[0] ??
        null
      )
    }
    // search through trades with varying hops, find best trade out of them
    let bestTradeSoFar: Trade<Currency, Currency, TradeType.EXACT_OUTPUT> | null = null
    for (let i = 1; i <= maxHops; i++) {
      const currentTrade =
        Trade.bestTradeExactOut(allowedPairs, currencyIn, currencyAmountOut, { maxHops: i, maxNumResults: 1 })[0] ??
        null
      if (isTradeBetter(bestTradeSoFar, currentTrade, BETTER_TRADE_LESS_HOPS_THRESHOLD)) {
        bestTradeSoFar = currentTrade
      }
    }
    return bestTradeSoFar
  }
  return null
}
