export {}
import Decimal from "decimal.js";
import JSBI from "jsbi";
import { Currency, CurrencyAmount, Fraction, Percent } from "@uniswap/sdk-core";
import { SupportedChainId } from "constants/chains";
import { getToken } from "methods/tokenLists";

/**
 * Return exponent from decimals number.
 * @param {number | string} decimals Number of decimals.
 * @returns {JSBI}
 */
export function toJSBI(decimals: number | string = 18): JSBI {
  if (decimals === 0) {
    return JSBI.BigInt(1)
  }
  return JSBI.exponentiate(JSBI.BigInt(10), JSBI.BigInt(decimals))
}

/**
 * Decimal into JS Big Integer.
 * @param {number | string} decimal Decimal number.
 * @param {number | string} decimals Number of decimals.
 * @returns {JSBI}
 */
export function decimalToJSBI(decimal: number | string, decimals: number | string = 18): JSBI {
  return JSBI.BigInt(new Decimal(decimal).mul(toJSBI(decimals).toString()).toFixed(0))
}

/**
 * Converts decimal number into percent object.
 * @param {number | string} decimalPercent Percent in decimal representation.
 * @returns {Percent}
 */
export function decimalPercentToPercent(decimalPercent: number | string): Percent {
  const [n, d] = new Decimal(decimalPercent).toFraction(1e18)
  return new Percent(n.toFixed(), d.mul(100).toFixed(0))
}

/**
 * Converts decimal number into percent object.
 * @param {number | string} decimal Decimal number.
 * @returns {Percent}
 */
export function decimalToFraction(decimal: number | string): Fraction {
  return new Fraction(...new Decimal(decimal).toFraction(1e18).map(v => v.toFixed(0)) as [string, string])
}

/**
 * Returns currency amount object for G$ in given chain ID.
 * @param {SupportedChainId} chainId Chain ID.
 * @param {number | string} amount Decimal value of G$ tokens.
 * @returns {Promise<CurrencyAmount>}
 */
export async function g$FromDecimal(chainId: SupportedChainId, amount: number | string): Promise<CurrencyAmount<Currency>> {
  const G$ = await getToken(chainId, 'G$')
  if (!G$) {
    throw new Error('Unsupported chain ID')
  }

  return CurrencyAmount.fromRawAmount(G$, decimalToJSBI(amount, G$.decimals))
}
