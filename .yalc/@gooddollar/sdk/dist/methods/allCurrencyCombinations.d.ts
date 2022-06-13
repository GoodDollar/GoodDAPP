import { Currency } from '@uniswap/sdk-core';
import { SupportedChainId } from 'constants/chains';
/**
 * Calculates all currency combinations in given chain that could be used to build exchange path.
 * @param {SupportedChainId} chainId Chain ID.
 * @param {Currency} currencyA Currency from.
 * @param {Currency} currencyB Currency to.
 * @returns {Promise<Array<[Currency, Currency]>>} List of pairs.
 */
export declare const allCurrencyCombinations: ((chainId: SupportedChainId, currencyA?: Currency, currencyB?: Currency) => Promise<Array<[Currency, Currency]>>) & import("lodash").MemoizedFunction;
//# sourceMappingURL=allCurrencyCombinations.d.ts.map