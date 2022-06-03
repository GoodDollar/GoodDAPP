import Web3 from 'web3';
import { Currency, CurrencyAmount, NativeCurrency, Token } from '@uniswap/sdk-core';
/**
 * Token or native currency balance for given network.
 * @param {Web3} web3 Web3 instance.
 * @param {Token | string} token Token instance or token's symbol representation in given network.
 * @param {string} account Account address.
 * @returns {Promise<CurrencyAmount>}
 */
export declare function tokenBalance(web3: Web3, token: Token | string, account: string): Promise<CurrencyAmount<NativeCurrency | Currency>>;
//# sourceMappingURL=tokenBalance.d.ts.map