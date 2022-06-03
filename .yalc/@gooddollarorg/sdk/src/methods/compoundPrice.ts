import Web3 from "web3";
import { Fraction } from "@uniswap/sdk-core";
import memoize from 'lodash/memoize'

import { delayedCacheClear } from "utils/memoize";
import { compoundContract } from "contracts/CompoundContract";
import { getTokenByAddress } from "./tokenLists";

/**
 * Calculates compound -> underlying ratio.
 * @param {Web3} web3 Web3 instance.
 * @param {number} chainId Chain ID for cache.
 * @param {string} address Chain ID for cache.
 * @returns {Fraction} Ratio.
 */
export const compoundPrice = memoize<(web3: Web3, address: string, chainId: number) => Promise<Fraction>>(
  async (web3, address: string): Promise<Fraction> => {
    const [contract, token] = await Promise.all([
      compoundContract(web3, address),
      getTokenByAddress(web3, address)
    ])

    let denominator = 1e28
    if (token.symbol === 'cUSDC' || token.symbol === 'cUSDT') {
      denominator = 1e16
    } else if (token.symbol === 'cWBTC') {
      denominator = 1e18
    }

    const value = await contract.methods.exchangeRateCurrent().call()

    delayedCacheClear(compoundPrice)

    return new Fraction(value, denominator)
  }, (_, __, chainId) => chainId
)
