import Web3 from "web3";
import { Currency, CurrencyAmount } from "@uniswap/sdk-core";
/**
 * Calculated exit contribution for an account.
 * @param {Web3} web3 Web3 instance.
 * @param {CurrencyAmount} G$Currency Amount of G$Currency account wants to sell.
 * @param {string} account Account's address.
 * @returns {CurrencyAmount} Exit contribution ratio.
 */
export declare function calculateExitContribution(web3: Web3, G$Currency: CurrencyAmount<Currency>, account: string): Promise<CurrencyAmount<Currency>>;
//# sourceMappingURL=calculateExitContribution.d.ts.map