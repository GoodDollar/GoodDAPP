import { Pair } from '@uniswap/v2-sdk'
import { Currency, CurrencyAmount, Token } from '@uniswap/sdk-core'
import { BigNumber } from 'ethers'
import JSBI from "jsbi";

import { PairContract } from "../contracts/PairContract";
import { UNISWAP_FACTORY_ADDRESSES } from '../constants/addresses'
import { computePairAddress } from "../utils/computePairAddress";
import { SupportedChainId } from "../constants/chains";

type Response = {
  reserve0: BigNumber
  reserve1: BigNumber
  tokenA: Token
  tokenB: Token
}

export enum PairState {
  EXISTS,
  INVALID,
}

/**
 * Calculates all existed currency combinations in given chain.
 * @param {SupportedChainId} chainId Chain ID.
 * @param {Array<[Currency, Currency]>} currencies Result of method allCurrencyCombinations(...).
 * @returns {Promise<[PairState, Pair | null][]>} List of pairs that can be used for currencies exchange.
 */
export async function v2Pairs(chainId: SupportedChainId, currencies: Array<[Currency, Currency]>): Promise<[PairState, Pair | null][]> {
  const tokens = currencies.map(([currencyA, currencyB]) => [currencyA.wrapped, currencyB.wrapped])

  const pairAddresses = tokens.reduce((map, [tokenA, tokenB]) => {
    // Token A should be strictly less than token B
    if (tokenA.address.toLowerCase() > tokenB.address.toLowerCase()) {
      [tokenA, tokenB] = [tokenB, tokenA]
    }

    const address = tokenA &&
    tokenB &&
    tokenA.chainId === tokenB.chainId &&
    !tokenA.equals(tokenB) &&
    UNISWAP_FACTORY_ADDRESSES[tokenA.chainId]
      ? computePairAddress(tokenA.chainId, tokenA, tokenB).toLowerCase()
      : undefined

    if (address) {
      map.set(address, [tokenA!, tokenB!])
    }

    return map
  }, new Map() as Map<string, [Token, Token]>)

  const promises = []
  for (const address of pairAddresses.keys()) {
    promises.push(new Promise(async (resolve, reject) => {
      try {
        const data = await PairContract(chainId, address).getReserves()
        const [tokenA, tokenB] = pairAddresses.get(address)!
        resolve({ ...data, tokenA, tokenB })
      } catch (e) {
        reject(e)
      }
    }))
  }

  const result = await Promise.allSettled(promises)
  const pairs = result.filter((pair): pair is PromiseFulfilledResult<Response> => pair.status === 'fulfilled').map(pair => pair.value)

  return pairs.map((pair) => {
    const { reserve0, reserve1, tokenA, tokenB } = pair

    if (!tokenA || !tokenB || tokenA.equals(tokenB)) return [PairState.INVALID, null]
    const [token0, token1] = tokenA.sortsBefore(tokenB) ? [tokenA, tokenB] : [tokenB, tokenA]

    return [
      PairState.EXISTS,
      new Pair(
        CurrencyAmount.fromRawAmount(token0, JSBI.BigInt(reserve0.toString())),
        CurrencyAmount.fromRawAmount(token1, JSBI.BigInt(reserve1.toString()))
      ),
    ]
  })
}
