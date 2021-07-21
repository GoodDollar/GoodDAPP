import { Currency, CurrencyAmount, TradeType } from "@uniswap/sdk-core";
import { Trade } from "@uniswap/v2-sdk";

import { allCommonPairs } from "./allCommonPairs";
import { isTradeBetter } from "../utils/isTradeBetter";
import { BETTER_TRADE_LESS_HOPS_THRESHOLD } from "../constants/misc";
import { SupportedChainId } from "../constants/chains";
import { debug } from "../utils/debug";

const MAX_HOPS = 2

/**
 * Returns the best trade for the token in to the exact amount of token in.
 * @param {CurrencyAmount} currencyAmountIn Currency exchange from
 * @param {Currency} currencyOut Currency exchange to.
 * @param {number=3} maxHops Maximum hops to find the best exchange route.
 * @param {SupportedChainId} chainId Chain ID.
 * @returns {Promise<Trade>}
 */
export async function v2TradeExactIn(
  currencyAmountIn?: CurrencyAmount<Currency>,
  currencyOut?: Currency,
  { maxHops = MAX_HOPS, chainId = SupportedChainId.MAINNET } = {}
): Promise<Trade<Currency, Currency, TradeType.EXACT_INPUT> | null> {
  const allowedPairs = await allCommonPairs(chainId, currencyAmountIn?.currency, currencyOut)

  debug(allowedPairs.map(pair => [pair.token0.symbol, pair.token0.address, pair.token1.symbol, pair.token1.address]))

  if (currencyAmountIn && currencyOut && allowedPairs.length > 0) {
    if (maxHops === 1) {
      return (
        Trade.bestTradeExactIn(allowedPairs, currencyAmountIn, currencyOut, { maxHops: 1, maxNumResults: 1 })[0] ??
        null
      )
    }
    // search through trades with varying hops, find best trade out of them
    let bestTradeSoFar: Trade<Currency, Currency, TradeType.EXACT_INPUT> | null = null
    for (let i = 1; i <= maxHops; i++) {
      const currentTrade: Trade<Currency, Currency, TradeType.EXACT_INPUT> | null =
        Trade.bestTradeExactIn(allowedPairs, currencyAmountIn, currencyOut, { maxHops: i, maxNumResults: 1 })[0] ??
        null

      // if current trade is best yet, save it
      if (isTradeBetter(bestTradeSoFar, currentTrade, BETTER_TRADE_LESS_HOPS_THRESHOLD)) {
        bestTradeSoFar = currentTrade
      }
    }
    return bestTradeSoFar
  }

  return null
}
