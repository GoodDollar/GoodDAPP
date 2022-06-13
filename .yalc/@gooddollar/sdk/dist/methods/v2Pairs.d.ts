import { Pair } from '@uniswap/v2-sdk';
import { Currency } from '@uniswap/sdk-core';
import { SupportedChainId } from "constants/chains";
export declare enum PairState {
    EXISTS = 0,
    INVALID = 1
}
/**
 * Calculates all existed currency combinations in given chain.
 * @param {SupportedChainId} chainId Chain ID.
 * @param {Array<[Currency, Currency]>} currencies Result of method allCurrencyCombinations(...).
 * @returns {Promise<[PairState, Pair | null][]>} List of pairs that can be used for currencies exchange.
 */
export declare function v2Pairs(chainId: SupportedChainId, currencies: Array<[Currency, Currency]>): Promise<[PairState, Pair | null][]>;
//# sourceMappingURL=v2Pairs.d.ts.map