import Web3 from "web3";
import { Fraction } from "@uniswap/sdk-core";
import memoize from 'lodash/memoize'

import { cDaiContract } from "contracts/CDaiContract";
import { delayedCacheClear } from "utils/memoize";

/**
 * Calculates cDAI -> DAI ratio.
 * @param {Web3} web3 Web3 instance.
 * @param {number} chainId Chain ID for cache.
 * @returns {Fraction} Ratio.
 */
export const cDaiPrice = memoize<(web3: Web3, chainId: number) => Promise<Fraction>>(
  async (web3): Promise<Fraction> => {
    const contract = await cDaiContract(web3)

    const value = await contract.methods.exchangeRateCurrent().call()

    delayedCacheClear(cDaiPrice)

    return new Fraction(value, 1e28)
  }, (_, chainId) => chainId
)