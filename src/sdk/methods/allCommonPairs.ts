import { Currency } from "@uniswap/sdk-core";
import { Pair } from "@uniswap/v2-sdk";

import { allCurrencyCombinations as getAllCurrencyCombinations } from "./allCurrencyCombinations";
import { PairState, v2Pairs } from "./v2Pairs";
import { SupportedChainId } from "../constants/chains";

/**
 * Calculates possible pairs in given chain that could be used to build exchange path.
 * @param {SupportedChainId} chainId Chain ID.
 * @param {Currency} currencyA Currency from.
 * @param {Currency} currencyB Currency to.
 * @return {Pair[]} List of pairs.
 */
export async function allCommonPairs(chainId: SupportedChainId, currencyA?: Currency, currencyB?: Currency): Promise<Pair[]> {
  const allCurrencyCombinations = await getAllCurrencyCombinations(chainId, currencyA, currencyB)
  const allPairs = await v2Pairs(chainId, allCurrencyCombinations)
  // Only pass along valid pairs, non-duplicated pairs.
  return Object.values(
    allPairs
      // Filter out invalid pairs.
      .filter((result): result is [PairState.EXISTS, Pair] => Boolean(result[0] === PairState.EXISTS && result[1]))
      // Filter out duplicated pairs.
      .reduce<{ [pairAddress: string]: Pair }>((memo, [, curr]) => {
        memo[curr.liquidityToken.address] = memo[curr.liquidityToken.address] ?? curr
        return memo
      }, {})
  )
}