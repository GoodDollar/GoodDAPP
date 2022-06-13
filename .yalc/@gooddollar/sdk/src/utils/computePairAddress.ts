import { Token } from "@uniswap/sdk-core";
import { getCreate2Address } from "@ethersproject/address";
import { keccak256, pack } from "@ethersproject/solidity";
import memoize from "lodash/memoize";

import { SupportedChainId } from "constants/chains";
import { UNISWAP_FACTORY_ADDRESSES, UNISWAP_INIT_CODE_HASH } from "constants/addresses";

/**
 * Compute pair address between tokens for uniswap.
 * @param {SupportedChainId} chainId Chain ID.
 * @param {Token} tokenA Token A.
 * @param {Token} tokenB Token B.
 * @returns {string} Pair address.
 */
export const computePairAddress = memoize<(chainId: SupportedChainId, tokenA: Token, tokenB: Token) => string>(
  (chainId, tokenA, tokenB): string => {
    if (!tokenA.sortsBefore(tokenB)) {
      [tokenA, tokenB] = [tokenB, tokenA]
    }
    return getCreate2Address(
      UNISWAP_FACTORY_ADDRESSES[chainId],
      keccak256(['bytes'], [pack(['address', 'address'], [tokenA.address, tokenB.address])]),
      UNISWAP_INIT_CODE_HASH[chainId])
  }, (...args: any[]) => args[0] + args[1].symbol + args[2].symbol
)
