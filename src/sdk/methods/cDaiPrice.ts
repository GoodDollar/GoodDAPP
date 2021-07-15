import Web3 from "web3";
import { Fraction } from "@uniswap/sdk-core";

import { cDaiContract } from "../contracts/CDaiContract";

/**
 * Calculates cDAI -> DAI ratio.
 * @param {Web3} web3 Web3 instance.
 * @return {Fraction} Ratio.
 */
export async function cDaiPrice(web3: Web3): Promise<Fraction> {
  const contract = await cDaiContract(web3)

  const value = await contract.methods.exchangeRateCurrent().call()

  return new Fraction(value, Math.pow(10, 28))
}