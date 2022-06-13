export {};
import JSBI from "jsbi";
import { Currency, CurrencyAmount, Fraction, Percent } from "@uniswap/sdk-core";
import { SupportedChainId } from "constants/chains";
/**
 * Return exponent from decimals number.
 * @param {number | string} decimals Number of decimals.
 * @returns {JSBI}
 */
export declare function toJSBI(decimals?: number | string): JSBI;
/**
 * Decimal into JS Big Integer.
 * @param {number | string} decimal Decimal number.
 * @param {number | string} decimals Number of decimals.
 * @returns {JSBI}
 */
export declare function decimalToJSBI(decimal: number | string, decimals?: number | string): JSBI;
/**
 * Converts decimal number into percent object.
 * @param {number | string} decimalPercent Percent in decimal representation.
 * @returns {Percent}
 */
export declare function decimalPercentToPercent(decimalPercent: number | string): Percent;
/**
 * Converts decimal number into percent object.
 * @param {number | string} decimal Decimal number.
 * @returns {Percent}
 */
export declare function decimalToFraction(decimal: number | string): Fraction;
/**
 * Returns currency amount object for G$ in given chain ID.
 * @param {SupportedChainId} chainId Chain ID.
 * @param {number | string} amount Decimal value of G$ tokens.
 * @returns {Promise<CurrencyAmount>}
 */
export declare function g$FromDecimal(chainId: SupportedChainId, amount: number | string): Promise<CurrencyAmount<Currency>>;
//# sourceMappingURL=converter.d.ts.map