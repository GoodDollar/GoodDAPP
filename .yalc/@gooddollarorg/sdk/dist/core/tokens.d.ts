import { Currency } from '@uniswap/sdk-core';
import { SupportedChainId } from 'constants/chains';
/**
 * Return list of tokens based on current chain ID.
 * @param {string | number} chainId Web3 instance.
 * @returns {Currency[]}
 */
export declare function getList(chainId: SupportedChainId): Promise<Currency[]>;
//# sourceMappingURL=tokens.d.ts.map