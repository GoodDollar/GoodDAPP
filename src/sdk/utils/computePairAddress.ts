import { Token } from "@uniswap/sdk-core";
import { getCreate2Address } from "@ethersproject/address";
import { keccak256, pack } from "@ethersproject/solidity";

import { SupportedChainId } from "../constants/chains";
import { UNISWAP_FACTORY_ADDRESSES, UNISWAP_INIT_CODE_HASH } from "../constants/addresses";

/**
 * Compute pair address between tokens for uniswap.
 * @param {SupportedChainId} chainId Chain ID.
 * @param {Token} tokenA Token A.
 * @param {Token} tokenB Token B.
 * @return {string} Pair address.
 */
export function computePairAddress(chainId: SupportedChainId, tokenA: Token, tokenB: Token): string {
  return getCreate2Address(
    UNISWAP_FACTORY_ADDRESSES[chainId],
    keccak256(['bytes'], [pack(['address', 'address'], [tokenA.address, tokenB.address])]),
    UNISWAP_INIT_CODE_HASH[chainId]
  )
}
