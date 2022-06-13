import Web3 from 'web3';
import { Currency, Token } from '@uniswap/sdk-core';
import { SupportedChainId } from 'constants/chains';
/**
 * Cache single token.
 * @param {SupportedChainId} supportedChainId Chain ID.
 * @param {Token} token Necessary token.
 */
export declare function cacheToken(supportedChainId: SupportedChainId, token: Token): Promise<void>;
/**
 * Trying to fetch token from predefined list or fetch it from ERC20 contract.
 * @param {Web3} web3 Web3 instance.
 * @param {string} address Token address.
 * @returns {Token | Currency}
 */
export declare function getTokenByAddress(web3: Web3, address: string): Promise<Token | Currency>;
/**
 * Retrieves and cache list of tokens for given chain ID.
 * @param {SupportedChainId} supportedChainId Chain ID.
 * @returns {Promise<[Map<string, Currency>, Map<string, Currency>]>} Pairs of `symbol <-> Currency`.
 */
export declare function getTokens(supportedChainId: SupportedChainId): Promise<[Map<string, Currency>, Map<string, Currency>]>;
/**
 * Get single token from cached list of tokens.
 * @param {SupportedChainId} supportedChainId Chain ID.
 * @param {string} symbol Symbol, that represents currency.
 * @returns {Promise<Currency | undefined>} Given currency or undefined, if it not exists.
 */
export declare function getToken(supportedChainId: SupportedChainId, symbol: string): Promise<Currency | undefined>;
/**
 * Get single token from cached list of tokens.
 * @param {SupportedChainId} supportedChainId Chain ID.
 * @param {string} address Address, that represents currency.
 * @returns {Promise<Currency | undefined>} Given currency or undefined, if it not exists.
 */
export declare function getTokenByAddressFromList(supportedChainId: SupportedChainId, address: string): Promise<Currency | undefined>;
//# sourceMappingURL=tokenLists.d.ts.map